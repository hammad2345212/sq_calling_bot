const sessions = new Map();

function setCallState(callSid, key, value) {
  if (!sessions.has(callSid)) sessions.set(callSid, {});
  sessions.get(callSid)[key] = value;
}

function getCallState(callSid, key) {
  return sessions.get(callSid)?.[key];
}

function clearCall(callSid) {
  sessions.delete(callSid);
}

module.exports = {
  setCallState,
  getCallState,
  clearCall,
};
