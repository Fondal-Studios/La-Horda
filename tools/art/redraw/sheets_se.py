"""Cell coordinates for the San Martín ('libertador') sheet (1536x1024), measured with the
dark-separator detector in build_se.py --probe and checked by eye (see docs/SANMARTIN_LIBERTADOR.md)."""
def row(xs, y0, y1):
    """consecutive cell borders -> list of (x0, y0, x1, y1) cells"""
    return [(xs[i], y0, xs[i+1], y1) for i in range(len(xs)-1)]

LIB = {
  # forma a pie
  'walk_down':  row([11,96,183,271,361], 91, 177),
  'walk_left':  row([376,470,567,664,763], 91, 177),
  'walk_right': row([777,869,961,1055,1153], 91, 177),
  'walk_up':    row([1168,1255,1347,1437,1526], 91, 177),
  'idle':       row([11,90,171,257,346], 227, 306),
  'aim':        row([359,443,534,621,709], 227, 306),
  'fire':       row([722,800,880,960,1044], 227, 306),
  'reload':     row([1057,1131,1209,1288,1369,1449,1526], 227, 306),
  'bayo_pre':   row([11,99,190,283,377], 357, 436),
  'bayo_emb':   row([392,488,580,671,767], 357, 436),
  'bayo_imp':   row([781,871,961,1054,1147], 357, 436),
  'bayo_rem':   row([1161,1252,1343,1434,1525], 357, 436),
  'command':    row([11,114,213,319,432,544], 486, 572),
  'cabral':     row([11,99,186,275,378,470], 924, 1010),
  # montado (caballo blanco)
  'mount':      row([11,122,231,352,435], 623, 721),
  'charge':     row([446,572,692,821,944,1067], 623, 721),
  'dismount':   row([1079,1185,1298,1414,1526], 623, 721),
  'ult':        row([11,101,205,336,445,561,671,787,912], 774, 874),
  'mounted':    row([924,1036,1154,1276,1399,1526], 774, 874),
  # efectos
  'spectral':   row([571,686,802,919,1036,1156], 486, 572),
  'buff_icon':  row([1176,1260,1347,1436,1526], 486, 572),
  'shot':       row([482,655], 924, 1010),
  'smoke':      row([660,725,795,865,936], 924, 1010),
  'blood':      [(943,924,1018,1010),(1023,924,1096,1010)],
  'dust':       row([1102,1176,1254,1331], 924, 1010),
  'frost':      row([1341,1433,1526], 924, 1010),
}
