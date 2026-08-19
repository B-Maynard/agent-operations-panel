import { EventEmitter } from 'node:events'

export const events = new EventEmitter()
events.setMaxListeners(100)

export function emitRun(run: unknown): void {
  events.emit('run', run)
  events.emit(`run:${(run as { id: string }).id}`, run)
}

export function emitAgent(agent: unknown): void {
  events.emit('agent', agent)
  events.emit(`agent:${(agent as { id: string }).id}`, agent)
}