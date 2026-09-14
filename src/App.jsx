import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'
import './App.css'
import { io } from 'socket.io-client'

function App() {
  const [columns, setColumns] = useState([])

 useEffect(() => {
    loadBoard()

    const socket = io()

    socket.on('board-updated', function () {
      loadBoard()
    })

    return function () {
      socket.disconnect()
    }
}, [])

  function loadBoard() {
    fetch('/api/board')
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        setColumns(data)
      })
  }

  function addCard(columnId, text) {
    fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_id: columnId, text: text })
    })
      .then(function (response) {
        return response.json()
      })
      .then(function () {
        loadBoard()
      })
  }

  function editCard(cardId, text) {
    fetch('/api/cards/' + cardId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    })
      .then(function () {
        loadBoard()
      })
  }

  function deleteCard(cardId) {
    fetch('/api/cards/' + cardId, {
      method: 'DELETE'
    })
      .then(function () {
        loadBoard()
      })
  }

  function onDragEnd(result) {
    const { source, destination } = result

    if (!destination) {
      return
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newColumns = columns.map(function (column) {
      return { ...column, cards: [...column.cards] }
    })

    const sourceColumn = newColumns.find(function (col) {
      return String(col.id) === source.droppableId
    })
    const destColumn = newColumns.find(function (col) {
      return String(col.id) === destination.droppableId
    })

    const [movedCard] = sourceColumn.cards.splice(source.index, 1)
    destColumn.cards.splice(destination.index, 0, movedCard)

    setColumns(newColumns)

    const sourceCardIds = sourceColumn.cards.map(function (card) {
      return card.id
    })
    const destCardIds = destColumn.cards.map(function (card) {
      return card.id
    })

    fetch('/api/columns/' + sourceColumn.id + '/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardIds: sourceCardIds })
    })

    if (sourceColumn.id !== destColumn.id) {
      fetch('/api/columns/' + destColumn.id + '/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: destCardIds })
      })
    }
  }

  return (
    <div className="board">
      <h1>Kanban Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {columns.map(function (column) {
            return (
              <Column
                key={column.id}
                column={column}
                onAddCard={addCard}
                onEditCard={editCard}
                onDeleteCard={deleteCard}
              />
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}

export default App