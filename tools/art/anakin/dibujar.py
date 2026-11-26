# dibujar.py - lote de dibujos de La Horda con el MOTOR de Anakin (sd-cli), por su circuito.
# Uso: py dibujar.py lote.json
# lote.json: {"salida": dir, "items": [{"id","prompt","neg","init","ref","fuerza","fuerza_ref","semilla","W","H","lora"}]}
# Cada resultado se anota en <salida>/registro_pendiente.jsonl para pasarlo a las creaciones de Anakin
# (/core/v1/creacion_registrar) con proyecto, flujo, parametros y referencia.
import json, os, sys, subprocess, time, ctypes
PC = os.path.join(os.environ['USERPROFILE'], 'neon-panel', 'pc')
IMG = os.path.join(PC, 'tools', 'imagenes')
EXE = os.path.join(IMG, 'motor', 'sd-cli.exe')
MOD = os.path.join(IMG, 'modelos')
NEG = 'blurry, smooth gradient, photo, 3d render, text, watermark, frame, border, multiple objects, cropped, ground tile, floor, shadow'

def mutex():
    k = ctypes.windll.kernel32
    h = k.CreateMutexW(None, False, 'Global\\AnakinDibujo')
    r = k.WaitForSingleObject(h, 15 * 60 * 1000)   # espera el turno del motor (otra sesion dibujando)
    return h, r in (0, 0x80)

def correr(it, salida):
    out = os.path.join(salida, '%s_s%d.png' % (it['id'], it.get('semilla', 7)))
    if os.path.exists(out):
        return out, 0.0, 'ya'
    p = it['prompt']
    lora = it.get('lora', 'PixelArtRedmond15V:0.55')
    if lora:
        p += ' <lora:%s>' % lora
    a = [EXE, '--vae-tiling', '--offload-to-cpu', '-m', os.path.join(MOD, 'DreamShaper8_LCM.safetensors'),
         '-p', p, '-n', it.get('neg', NEG), '--sampling-method', 'lcm', '--steps', '8', '--cfg-scale', '1.5',
         '-W', str(it.get('W', 512)), '-H', str(it.get('H', 512)), '-s', str(it.get('semilla', 7)), '-o', out]
    if it.get('init'):
        a += ['-i', it['init'], '--strength', str(it.get('fuerza', 0.6))]
    if it.get('ref'):
        a += ['--clip_vision', os.path.join(MOD, 'clip_vision_h.safetensors'), '--ip-adapter',
              os.path.join(MOD, 'ip-adapter-plus_sd15.safetensors'), '--ip-adapter-image', it['ref'],
              '--ip-adapter-strength', str(it.get('fuerza_ref', 0.3))]
    if lora:
        a += ['--lora-model-dir', os.path.join(IMG, 'loras')]
    h, ok = mutex()
    t0 = time.time()
    try:
        r = subprocess.run(a, cwd=os.path.dirname(EXE), capture_output=True, text=True, timeout=600)
    finally:
        ctypes.windll.kernel32.ReleaseMutex(h)
    seg = round(time.time() - t0, 1)
    if not os.path.exists(out):
        return None, seg, (r.stderr or r.stdout)[-400:]
    return out, seg, 'ok'

def main():
    lote = json.load(open(sys.argv[1], encoding='utf-8'))
    salida = lote['salida']
    os.makedirs(salida, exist_ok=True)
    reg = os.path.join(salida, 'registro_pendiente.jsonl')
    for it in lote['items']:
        out, seg, msg = correr(it, salida)
        print('%s %s %ss %s' % (it['id'], 'OK' if out else 'FALLO', seg, msg if not out else ''), flush=True)
        if out and msg == 'ok':
            par = {k: it.get(k) for k in ('semilla', 'fuerza', 'fuerza_ref', 'lora', 'init', 'W', 'H')}
            fila = {'archivo': out, 'prompt': it['prompt'], 'evitar': it.get('neg', NEG), 'proyecto': 'La-Horda',
                    'flujo': 'sd-cli+init+ipadapter+lora', 'tipo': 'imagen', 'referencia': it.get('ref', ''),
                    'pedido': lote.get('pedido', '') + ' | ' + it['id'], 'segundos': seg, 'parametros': par}
            with open(reg, 'a', encoding='utf-8') as f:
                f.write(json.dumps(fila, ensure_ascii=False) + '\n')

if __name__ == '__main__':
    main()
