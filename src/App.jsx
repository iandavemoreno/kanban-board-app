import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { io } from 'socket.io-client'
import Column from './Column'
import './App.css'

function App() {
  const [columns, setColumns] = useState([])
  const [newColumnTitle, setNewColumnTitle] = useState('')

  useEffect(() => {
    loadBoard()
    const socket = io()
    socket.on('board-updated', function () { loadBoard() })
    return function () { socket.disconnect() }
  }, [])

  function loadBoard() {
    fetch('/api/board').then(r => r.json()).then(data => setColumns(data))
  }
  function addCard(columnId, text) {
    fetch('/api/cards', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ column_id: columnId, text: text }) })
  }
  function editCard(cardId, text) {
    fetch('/api/cards/' + cardId, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: text }) })
  }
  function deleteCard(cardId) {
    fetch('/api/cards/' + cardId, { method: 'DELETE' })
  }
  function addColumn(title) {
    fetch('/api/columns', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title: title }) })
  }
  function renameColumn(columnId, title) {
    fetch('/api/columns/' + columnId, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title: title }) })
  }
  function deleteColumn(columnId) {
    fetch('/api/columns/' + columnId, { method: 'DELETE' })
  }
  function handleAddColumn(event) {
    event.preventDefault()
    if (!newColumnTitle.trim()) return
    addColumn(newColumnTitle.trim())
    setNewColumnTitle('')
  }
  function onDragEnd(result) {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return
    const newColumns = columns.map(c => ({ ...c, cards: [...c.cards] }))
    const sourceColumn = newColumns.find(col => String(col.id) === source.droppableId)
    const destColumn = newColumns.find(col => String(col.id) === destination.droppableId)
    const [movedCard] = sourceColumn.cards.splice(source.index, 1)
    destColumn.cards.splice(destination.index, 0, movedCard)
    setColumns(newColumns)
    const sourceCardIds = sourceColumn.cards.map(c => c.id)
    const destCardIds = destColumn.cards.map(c => c.id)
    fetch('/api/columns/' + sourceColumn.id + '/cards', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ cardIds: sourceCardIds }) })
    if (sourceColumn.id !== destColumn.id) {
      fetch('/api/columns/' + destColumn.id + '/cards', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ cardIds: destCardIds }) })
    }
  }

  return (
    <div className="board">
      <h1>Kanban Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {columns.map(column => (
            <Column key={column.id} column={column} onAddCard={addCard} onEditCard={editCard} onDeleteCard={deleteCard} onRenameColumn={renameColumn} onDeleteColumn={deleteColumn} />
          ))}
          <form onSubmit={handleAddColumn} className="add-column-form">
            <input type="text" value={newColumnTitle} onChange={e => setNewColumnTitle(e.target.value)} placeholder="New column title" aria-label="New column title" />
            <button type="submit">Add Column</button>
          </form>
        </div>
      </DragDropContext>
    </div>
  )
}
export default App