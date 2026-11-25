# pedir_api.py - pide un lote de dibujos a ANAKIN por su API de proyectos (circuito completo:
# cada dibujo queda en sus creaciones con proyecto, prompt, boceto, referencia y LoRA).
# Uso: py pedir_api.py lote.json   (clave en la variable de entorno de usuario ANAKIN_API_KEY)
# Pide de a uno (espera cada dibujo) para no encolar decenas de procesos sobre la placa.
# Copia cada resultado a <salida>/<id>_s<semilla>.png y anota {id, api_id, crea_id, archivo} en <salida>/pedidos.jsonl
# para despues mandar la evaluacion del doctor con /core/v1/dibujo_opinion.
import json, os, sys, time, shutil, urllib.parse, urllib.request
BASE = 'http://127.0.0.1:8778/core/v1/'

def clave():
    k = os.environ.get('ANAKIN_API_KEY')
    if not k and os.name == 'nt':
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Environment') as r:
            k = winreg.QueryValueEx(r, 'ANAKIN_API_KEY')[0]
    return k

def get(ruta, q, k, t=60):
    u = BASE + ruta + '?' + urllib.parse.urlencode(q)
    req = urllib.request.Request(u, headers={'X-Anakin-Key': k})
    with urllib.request.urlopen(req, timeout=t) as r:
        return json.loads(r.read().decode('utf-8'))

def main():
    lote = json.load(open(sys.argv[1], encoding='utf-8'))
    k = clave(); sal = lote['salida']; os.makedirs(sal, exist_ok=True)
    log = os.path.join(sal, 'pedidos.jsonl')
    hechos = set()
    if os.path.exists(log):
        hechos = {(lambda d: d.get('clave') or '%s_s%s' % (d['id'], d.get('semilla', 7)))(json.loads(l)) for l in open(log, encoding='utf-8') if l.strip()}
    for it in lote['items']:
        clave_it = '%s_s%s' % (it['id'], it.get('semilla', 7))
        if clave_it in hechos:
            continue
        q = {'prompt': it['prompt'], 'proyecto': 'La-Horda', 'formato': 'cuadrada', 'semilla': it.get('semilla', 7)}
        if it.get('neg'): q['evitar'] = it['neg']
        if it.get('init'): q['init'] = it['init'].replace('/', '\\'); q['fuerza_init'] = it.get('fuerza', 0.55)
        if it.get('ref'): q['referencia'] = it['ref'].replace('/', '\\'); q['fuerza_ref'] = it.get('fuerza_ref', 0.3)
        q['lora'] = it.get('lora', 'PixelArtRedmond15V:0.55')
        t0 = time.time()
        for intento in range(3):
            try:
                r = get('dibujar', q, k); break
            except Exception as e:
                r = {'ok': False, 'error': str(e)}; time.sleep(20)
        if not r.get('ok'):
            print(it['id'], 'RECHAZADO', r.get('error'), flush=True); continue
        aid = r['id']; e = {}
        while time.time() - t0 < 25 * 60:
            time.sleep(8)
            try:
                e = get('dibujo', {'id': aid}, k, 30)
            except Exception:
                continue
            if e.get('estado') not in ('en_cola', 'dibujando'):
                break
        seg = round(time.time() - t0)
        if e.get('estado') == 'listo' and e.get('archivo') and os.path.exists(e['archivo']):
            dst = os.path.join(sal, '%s_s%s.png' % (it['id'], it.get('semilla', 7)))
            shutil.copyfile(e['archivo'], dst)
            fila = {'clave': clave_it, 'id': it['id'], 'semilla': it.get('semilla', 7), 'api_id': aid, 'crea_id': e.get('crea_id'), 'archivo_anakin': e['archivo'], 'copia': dst, 'segundos': seg}
            open(log, 'a', encoding='utf-8').write(json.dumps(fila, ensure_ascii=False) + '\n')
            print(it['id'], 'OK', seg, 's', flush=True)
        else:
            print(it['id'], 'FALLO', e.get('estado'), e.get('error'), flush=True)

if __name__ == '__main__':
    main()
