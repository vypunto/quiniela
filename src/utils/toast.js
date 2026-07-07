const listeners = new Set()

let _id = 0

function emit(t) {
  listeners.forEach(fn => fn(t))
}

export const toast = {
  success: (message, duration = 3000) => emit({ id: ++_id, type: 'success', message, duration }),
  error:   (message, duration = 5000) => emit({ id: ++_id, type: 'error',   message, duration }),
  info:    (message, duration = 3000) => emit({ id: ++_id, type: 'info',    message, duration }),
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
}
