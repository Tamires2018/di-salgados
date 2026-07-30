function formatField(id, value) {
  const text = String(value);
  return `${id}${String(text.length).padStart(2, '0')}${text}`;
}

function removeAccents(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function crc16(payload) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000)
        ? ((crc << 1) ^ 0x1021)
        : (crc << 1);

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePix({
  key,
  name,
  city,
  amount,
  orderId
}) {
  const pixKey = String(key || '').trim();

  if (!pixKey) {
    throw new Error('A chave Pix não foi informada.');
  }

  const receiverName = removeAccents(name || 'DI SALGADOS')
    .toUpperCase()
    .slice(0, 25);

  const receiverCity = removeAccents(city || 'GARCA')
    .toUpperCase()
    .slice(0, 15);

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('O valor do Pix é inválido.');
  }

  const txid = removeAccents(`PEDIDO${orderId || ''}`)
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 25) || '***';

  const merchantAccount =
    formatField('00', 'BR.GOV.BCB.PIX') +
    formatField('01', pixKey);

  const additionalData = formatField('05', txid);

  let payload = '';

  payload += formatField('00', '01');
  payload += formatField('26', merchantAccount);
  payload += formatField('52', '0000');
  payload += formatField('53', '986');
  payload += formatField('54', numericAmount.toFixed(2));
  payload += formatField('58', 'BR');
  payload += formatField('59', receiverName);
  payload += formatField('60', receiverCity);
  payload += formatField('62', additionalData);

  payload += '6304';

  return payload + crc16(payload);
}