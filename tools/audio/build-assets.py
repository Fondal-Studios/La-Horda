#!/usr/bin/env python3
"""Reproduce assets/audio/ desde las fuentes CC0 (OpenGameArt). Uso: python3 tools/audio/build-assets.py [DIR_TEMPORAL]
Requiere ffmpeg, numpy y red. Escribe assets/audio/{music,sfx,voice}/*.mp3 y assets/audio/manifest.json.
Todas las fuentes son CC0 (dominio público): ver assets/audio/CREDITS.md."""
import json, os, subprocess, sys, shutil, urllib.request, zipfile, urllib.parse, re
import numpy as np  # solo para armar los bucles de la música
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'audio')
TMP = sys.argv[1] if len(sys.argv) > 1 else os.path.join('/tmp', 'lh-audio-src')
B = 'https://opengameart.org/sites/default/files/'
os.makedirs(TMP, exist_ok=True)

def fetch(name):
    p = os.path.join(TMP, re.sub(r'[^A-Za-z0-9._-]', '_', name))
    if not os.path.exists(p):
        req = urllib.request.Request(B + urllib.parse.quote(name), headers={'User-Agent': 'la-horda-asset-build'})
        with urllib.request.urlopen(req, timeout=120) as r, open(p, 'wb') as f: shutil.copyfileobj(r, f)
    return p
def unzip(name):
    z = fetch(name); d = z + '.d'
    if not os.path.isdir(d):
        with zipfile.ZipFile(z) as zf: zf.extractall(d)
    return d
def ff(args): subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip())

# ---------------- MÚSICA: lo-fi retro (menús, lento) y lo-fi de más BPM (partida) ----------------
# (id, archivo fuente, segundo inicial, duración máx, página de origen). Se cierra el bucle con un fundido cruzado
# de 2 s (el final se mezcla con el comienzo) y se normaliza a ~-18 LUFS para que todas pesen igual.
MUSIC = [
  ('title',  '8_bit_lofi_music.mp3',  0, 96, 'https://opengameart.org/content/8-bit-lofi'),
  ('hub',    'rhodes.mp3',            0, 92, 'https://opengameart.org/content/happy-lofi-day'),
  ('wave-a', 'fastsong_0.ogg',        0, 73, 'https://opengameart.org/content/fast-cheerful-punk-rock-lo-fi'),
  ('wave-b', 'lofiagain.ogg',         0, 88, 'https://opengameart.org/content/lofi-again'),
  ('wave-c', 'lofihiphop.ogg',        0, 90, 'https://opengameart.org/content/lofi-hip-hop'),  # (se descartó "Funky Hip Hop Lofi Jam": ~85 BPM, tan lento como los menús)
  ('boss',   'OldBrokenRadio.mp3',    0, 90, 'https://opengameart.org/content/lo-fi-chiptune-glitch-dnb'),
]
# ---------------- EFECTOS ----------------
RPG = ('80-CC0-RPG-SFX_0.zip', 'https://opengameart.org/content/80-cc0-rpg-sfx')
CRE = ('80-CC0-creature-SFX_0.zip', 'https://opengameart.org/content/80-cc0-creature-sfx')
HIT = ('sfx_breaking_and_falling.zip', 'https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx')
SWD = ('sword_-_starninjas_1.zip', 'https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes')
IMP = ('impact_-_starninjas.zip', 'https://opengameart.org/content/10-impactshield-blocks')
MAG = ('https://opengameart.org/content/magic-spell-sfx', ['magical_1_0.ogg', 'magical_2.ogg', 'magical_3.ogg', 'magical_4.ogg'])
def pick(pack, sub, names): return [(pack, sub, n) for n in names]
# (se descartó bfh1_rock_hit_01: quedaba en 78 ms, demasiado corto)
SFX = {
  'hitFlesh': pick(HIT, '', ['bfh1_hit_%02d.ogg' % i for i in (1, 2, 3, 4, 5, 6)]),
  'hitHeavy': pick(IMP, '', ['impact.%d.ogg' % i for i in (1, 2, 3, 4, 5, 6)]),
  'blade':    pick(SWD, 'sword - StarNinjas', ['sword.%d.ogg' % i for i in (1, 2, 3, 4, 5, 6)]),
  'swing':    pick(RPG, '', ['blade_01.ogg', 'blade_02.ogg', 'blade_03.ogg']),
  'rock':     pick(HIT, '', ['bfh1_rock_breaking_01.ogg', 'bfh1_rock_breaking_02.ogg', 'bfh1_rock_falling_01.ogg']),
  'metal':    pick(HIT, '', ['bfh1_metal_hit_01.ogg', 'bfh1_metal_hit_02.ogg', 'bfh1_metal_hit_04.ogg', 'bfh1_metal_hit_05.ogg']),
  'wood':     pick(HIT, '', ['bfh1_wood_hit_01.ogg', 'bfh1_wood_hit_02.ogg', 'bfh1_wood_hit_03.ogg']),
  'glass':    pick(HIT, '', ['bfh1_glass_breaking_01.ogg', 'bfh1_glass_breaking_02.ogg', 'bfh1_glass_breaking_03.ogg', 'bfh1_glass_breaking_04.ogg']),
  'fire':     pick(RPG, '', ['spell_fire_%02d.ogg' % i for i in (1, 2, 3, 4, 5, 6, 7)]),
  'arcane':   pick(RPG, '', ['spell_01.ogg', 'spell_02.ogg']) + [(None, MAG[0], n) for n in MAG[1]],
  'slime':    pick(RPG, '', ['creature_slime_%02d.ogg' % i for i in (1, 2, 3, 4)]),
  'roar':     pick(RPG, '', ['creature_roar_01.ogg', 'creature_roar_02.ogg', 'creature_roar_03.ogg']) + pick(CRE, '', ['roar_01.ogg', 'roar_02.ogg', 'roar_03.ogg']),
  'monster':  pick(CRE, '', ['monster_%02d.ogg' % i for i in (1, 2, 3, 4, 5, 6, 7)]),
  'creatureHurt': pick(CRE, '', ['hurt_%02d.ogg' % i for i in (1, 2, 3, 4, 5)]),
  'creatureDie':  pick(RPG, '', ['creature_die_01.ogg', 'creature_hurt_01.ogg', 'creature_hurt_02.ogg']),
}
# ---------------- VOCES (CC0): 1 masculina + 3 femeninas; cada campeón usa una con su propio tono ----------------
MV = ('RPG Male Adventurer.zip', 'https://opengameart.org/content/voice-clip-pack-male-adventurer-rpg', 'RPG Male Adventurer')
FV = ('RPG Voice Starter Pack.zip', 'https://opengameart.org/content/female-rpg-voice-starter-pack', 'RPG Voice Starter Pack')
VOICE = {}
for i in range(9): VOICE['m_attack%d' % i] = (MV, 'attack%d.wav' % i)
for i in range(6): VOICE['m_big%d' % i] = (MV, 'attackbig%d.wav' % i)
for i in range(6): VOICE['m_hurt%d' % i] = (MV, 'hurt%d.wav' % i)
for n in ('death0', 'death1', 'victory0', 'victory1', 'gameover0'): VOICE['m_' + n] = (MV, n + '.wav')
for t in (1, 2, 3):
    for n in ('attack1', 'attack2', 'attack3', 'damaged1', 'damaged2', 'damaged3', 'fire', 'ice', 'blizzard', 'heal', 'cure', 'curse', 'hex', 'hellstorm', 'tornado', 'burn', 'healed1'):
        VOICE['f%d_%s' % (t, n)] = (FV, 'Type %d/%s.wav' % (t, n))

def encode(src, dst, mono, br, af=''):
    chain = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.01,areverse,silenceremove=start_periods=1:start_threshold=-52dB,areverse'
    if af: chain += ',' + af
    ff(['-i', src, '-af', chain] + (['-ac', '1'] if mono else []) + ['-ar', '44100', '-c:a', 'libmp3lame', '-b:a', br, dst])
def maxdb(p):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', p, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.search(r'max_volume: (-?[\d.]+) dB', r).group(1))
def peak_norm(src, dst, mono, br, maxdur, target=-4.0):
    tmp = dst + '.tmp.wav'
    ff(['-i', src, '-t', str(maxdur), '-ac', '1' if mono else '2', tmp])
    mx = maxdb(tmp); g = target - mx
    for _ in range(4):  # el MP3 puede sobrepasar el pico: se verifica el archivo FINAL (<= -1,5 dBFS) y se baja si hace falta
        # inicio: se corta todo lo anterior a -32 dB (los golpes con una subida lenta sonaban ~200 ms tarde) dejando 4 ms
        af = 'volume=%.2fdB,silenceremove=start_periods=1:start_threshold=-32dB:start_silence=0.004,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse' % g
        ff(['-i', tmp, '-af', af, '-ac', '1' if mono else '2', tmp + '.2.wav'])
        d = dur(tmp + '.2.wav'); fade = min(0.12, d / 4)
        ff(['-i', tmp + '.2.wav', '-af', 'afade=t=out:st=%.3f:d=%.3f' % (d - fade, fade), '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', br, dst])
        out = subprocess.run(['ffmpeg', '-v', 'info', '-i', dst, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        if float(re.search(r'max_volume: (-?[\d.]+) dB', out).group(1)) <= -1.5: break
        g -= 1.5
    os.remove(tmp); os.remove(tmp + '.2.wav'); return round(dur(dst), 3)

man = {'music': {}, 'sfx': {}, 'voice': {}}
for sub in ('music', 'sfx', 'voice'): os.makedirs(os.path.join(OUT, sub), exist_ok=True)
C = 2.0
PAD = 1.0
for mid, fn, ss, mx, page in MUSIC:
    src = fetch(fn); L = min(mx, dur(src) - ss); dst = os.path.join(OUT, 'music', mid + '.mp3')
    sr = 44100; c = int(C * sr); pad = int(PAD * sr)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(ss), '-t', str(L), '-i', src, '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    # sonoridad: UNA ganancia constante hacia -18 LUFS (un loudnorm dinámico cambiaría el nivel entre el final y el comienzo)
    mi = subprocess.run(['ffmpeg', '-nostats', '-f', 'f32le', '-ar', str(sr), '-ac', '2', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=raw, capture_output=True).stderr.decode()
    integ = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', mi[mi.rfind('Summary'):])[0]); x *= 10 ** ((-18.0 - integ) / 20)
    pk = np.abs(x).max()
    if pk > 0.79:  # techo -2 dBFS: limitador de rodilla suave solo sobre las crestas (|x| > 0,5), sin tocar el resto
        a_ = np.abs(x); x = np.where(a_ > 0.5, np.sign(x) * (0.5 + 0.29 * np.tanh((a_ - 0.5) / 0.29)), x)
    # BUCLE SIN COSTURA: los últimos C segundos se funden (potencia constante) con los primeros C. Al repetir, la última muestra
    # (x[-c-1]) enlaza con la primera del fundido (x[-c]) sin salto.
    t = np.linspace(0, 1, c)[:, None]
    blend = x[-c:] * np.cos(t * np.pi / 2) + x[:c] * np.sin(t * np.pi / 2)
    y = np.concatenate([blend, x[c:-c]])
    # 1 s de relleno a cada lado: los extremos de un MP3 decodifican con artefactos y nunca se tocan (loopStart/loopEnd)
    ext = np.concatenate([y[-pad:], y, y[:pad]]).astype(np.float32)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '80k', dst], input=ext.tobytes(), check=True)
    man['music'][mid] = {'file': 'music/%s.mp3' % mid, 'seconds': round(dur(dst), 2), 'loopStart': PAD, 'loopEnd': round(PAD + len(y) / sr, 3), 'source': page, 'license': 'CC0'}
for sid, items in SFX.items():
    man['sfx'][sid] = {'files': [], 'license': 'CC0'}
    for k, (pack, sub, name) in enumerate(items):
        if pack is None: src = fetch(name); page = sub
        else: src = os.path.join(unzip(pack[0]), sub, name); page = pack[1]
        d = 'sfx/%s_%d.mp3' % (sid, k)
        s = peak_norm(src, os.path.join(OUT, d), True, '64k', 1.8)
        assert s >= 0.09, 'efecto demasiado corto: %s (%.3f s)' % (name, s)
        man['sfx'][sid]['files'].append({'file': d, 'seconds': s, 'source': page})
for vid, (pack, name) in VOICE.items():
    src = os.path.join(unzip(pack[0]), pack[2], name); d = 'voice/%s.mp3' % vid
    s = peak_norm(src, os.path.join(OUT, d), True, '56k', 2.5)
    man['voice'][vid] = {'file': d, 'seconds': s, 'source': pack[1], 'license': 'CC0'}
with open(os.path.join(OUT, 'manifest.json'), 'w') as f: json.dump(man, f, ensure_ascii=False, indent=1)
tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs)
print('listo: %d música, %d efectos, %d voces, %.1f MB' % (len(man['music']), sum(len(v['files']) for v in man['sfx'].values()), len(man['voice']), tot / 1e6))
