function nowISO() {
  return new Date().toISOString();
}

function addSeconds(date, seconds) {
  return new Date(new Date(date).getTime() + seconds * 1000).toISOString();
}

function isExpired(isoString) {
  return new Date(isoString) < new Date();
}

module.exports = { nowISO, addSeconds, isExpired };