import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

const COLUMNS = {
  books: ['id','title','author','category','isbn','year','copies','available','borrowed','tone'],
  borrowers: ['id','name','email','course','joined','status','borrowed','account_type'],
  staff: ['id','name','email','role','status'],
  transactions: ['id','borrower_id','borrower','book_id','title','issued','due','returned','status','fine','requested_at','claim_expires_at','cancelled_at','cancellation_reason'],
  notifications: ['id','message','audience','created_at','read_by'],
  library_settings: ['id','library_name','email','loan_days','max_books','fine_rate','renewals','due_reminders','overdue_alerts','new_arrivals','two_factor','session_timeout'],
}
const HAS_CREDENTIALS = ['staff', 'borrowers']
const toSnake = (k) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

function toRow(table, obj) {
  const row = {}
  const extra = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    const col = toSnake(k)
    if (COLUMNS[table].includes(col)) row[col] = v
    else extra[k] = v
  }
  if (typeof row.claim_expires_at === 'number') {
    row.claim_expires_at = new Date(row.claim_expires_at).toISOString()
  }
  if (HAS_CREDENTIALS.includes(table) && Object.keys(extra).length) row.credentials = extra
  return row
}

function fromRow(row) {
  const obj = {}
  for (const [k, v] of Object.entries(row)) {
    if (v === null || k === 'credentials') continue
    obj[toCamel(k)] = v
  }
  if (row.credentials) Object.assign(obj, row.credentials)
  if (obj.claimExpiresAt) obj.claimExpiresAt = Date.parse(obj.claimExpiresAt)
  return obj
}

async function save(table, prev, next, single) {
  if (single) {
    const { error } = await supabase.from(table).upsert({ ...toRow(table, next), id: 1 })
    if (error) console.error(`Save ${table} failed:`, error.message)
    return
  }
  const before = new Map(prev.map((r) => [r.id, JSON.stringify(r)]))
  const nextIds = new Set(next.map((r) => r.id))
  const changed = next.filter((r) => before.get(r.id) !== JSON.stringify(r))
  const removed = prev.filter((r) => !nextIds.has(r.id)).map((r) => r.id)
  if (changed.length) {
    const { error } = await supabase.from(table).upsert(changed.map((r) => toRow(table, r)))
    if (error) console.error(`Save ${table} failed:`, error.message)
  }
  if (removed.length) {
    const { error } = await supabase.from(table).delete().in('id', removed)
    if (error) console.error(`Delete from ${table} failed:`, error.message)
  }
}

export function useSupabaseState(table, fallback, { single = false } = {}) {
  const [value, setValue] = useState(single ? fallback : [])
  const [ready, setReady] = useState(false)
  const ref = useRef(single ? fallback : [])
  const readyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    supabase.from(table).select('*').then(({ data, error }) => {
      if (cancelled) return
      if (error) { console.error(`Load ${table} failed:`, error.message); return }
      const next = single
        ? (data[0] ? fromRow(data[0]) : fallback)
        : data.map(fromRow)
      ref.current = next
      readyRef.current = true
      setValue(next)
      setReady(true)
    })
    return () => { cancelled = true }
  }, [table]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((update) => {
    const prev = ref.current
    const next = typeof update === 'function' ? update(prev) : update
    if (next === prev) return
    ref.current = next
    setValue(next)
    if (readyRef.current) save(table, prev, next, single)
  }, [table, single])

  return [value, set, ready]
}