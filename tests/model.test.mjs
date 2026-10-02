import assert from 'node:assert/strict'
import test from 'node:test'
import {
  adjustStat,
  createDefaultDisplaySettings,
  createInitialMatch,
  createInitialTrackerState,
  ELEMENT_ORDER,
  STAT_ORDER,
  trackerReducer,
  toggleElement,
} from '../src/model.ts'

test('display preferences default to facing opponents with independent tribe themes', () => {
  assert.deepEqual(createDefaultDisplaySettings(), {
    players: [
      { name: 'Player 1', theme: 'Overworld' },
      { name: 'Player 2', theme: 'Mipedians' },
    ],
    layout: 'opposed',
    orientation: 'facing',
    keepScreenAwake: true,
  })
})

test('tracker records stat, element, and reset events in a session audit log', () => {
  let state = createInitialTrackerState()

  state = trackerReducer(state, {
    id: '1',
    timestamp: 1000,
    type: 'stat-adjusted',
    playerIndex: 0,
    playerName: 'Alya',
    stat: 'Energy',
    direction: 1,
  })
  state = trackerReducer(state, {
    id: '2',
    timestamp: 2000,
    type: 'element-toggled',
    playerIndex: 1,
    playerName: 'Bram',
    element: 'Fire',
  })

  assert.equal(state.players[0].stats.Energy, 55)
  assert.equal(state.players[1].elements.Fire, true)
  assert.deepEqual(
    state.auditLog.map((entry) => entry.message),
    ['Alya: Energy 50 -> 55', 'Bram: Fire turned on'],
  )

  state = trackerReducer(state, {
    id: '3',
    timestamp: 3000,
    type: 'match-reset',
  })

  assert.deepEqual(state.players, createInitialMatch())
  assert.match(state.auditLog.at(-1).message, /Match reset/)
})

test('tracker does not log a stat decrement that cannot change zero', () => {
  const state = createInitialTrackerState()
  const atZero = {
    ...state,
    players: [
      { ...state.players[0], stats: { ...state.players[0].stats, Energy: 0 } },
      state.players[1],
    ],
  }

  assert.strictEqual(
    trackerReducer(atZero, {
      id: 'noop',
      timestamp: 1000,
      type: 'stat-adjusted',
      playerIndex: 0,
      playerName: 'Player 1',
      stat: 'Energy',
      direction: -1,
    }),
    atZero,
  )
})

test('both players start with every stat at 50 and every element inactive', () => {
  const players = createInitialMatch()

  for (const player of players) {
    for (const stat of STAT_ORDER) {
      assert.equal(player.stats[stat], 50)
    }

    for (const element of ELEMENT_ORDER) {
      assert.equal(player.elements[element], false)
    }
  }
})

test('stat controls change by five and prevent values below zero', () => {
  const player = createInitialMatch()[0]
  const increased = adjustStat(player, 'Energy', 1)
  const decreased = adjustStat(player, 'Courage', -1)

  assert.equal(increased.stats.Energy, 55)
  assert.equal(increased.stats.Courage, 50)
  assert.equal(decreased.stats.Courage, 45)
  assert.equal(decreased.stats.Energy, 50)
  assert.equal(adjustStat(player, 'Speed', -1).stats.Speed, 45)
  for (const stat of STAT_ORDER) {
    const atZero = { ...player, stats: { ...player.stats, [stat]: 0 } }
    assert.equal(adjustStat(atZero, stat, -1).stats[stat], 0)
  }
  assert.equal(
    adjustStat({ ...player, stats: { ...player.stats, Energy: 100 } }, 'Energy', 1)
      .stats.Energy,
    105,
  )
})

test('element toggles stay independent between players and between elements', () => {
  const [firstPlayer, secondPlayer] = createInitialMatch()
  const firstWithFire = toggleElement(firstPlayer, 'Fire')

  assert.equal(firstWithFire.elements.Fire, true)
  assert.equal(firstWithFire.elements.Water, false)
  assert.equal(secondPlayer.elements.Fire, false)
})

test('a fresh match resets all stats and elements without sharing player state', () => {
  const [firstPlayer, secondPlayer] = createInitialMatch()
  const changedFirst = toggleElement(adjustStat(firstPlayer, 'Power', 1), 'Earth')
  const changedSecond = adjustStat(secondPlayer, 'Energy', -1)
  const resetPlayers = createInitialMatch()

  assert.equal(changedFirst.stats.Power, 55)
  assert.equal(changedFirst.elements.Earth, true)
  assert.equal(changedSecond.stats.Energy, 45)
  assert.notStrictEqual(resetPlayers[0].stats, resetPlayers[1].stats)
  assert.deepEqual(resetPlayers, createInitialMatch())
})