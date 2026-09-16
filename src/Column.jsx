import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import Card from './Card'

function Column({ column, onAddCard, onEditCard, onDeleteCard, onRenameColumn, onDeleteColumn }) {
  const [newCardText, setNewCardText] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)

  function handleAddCard(event) {
    event.preventDefault()

    if (!newCardText.trim()) {
      return
    }

    onAddCard(column.id, newCardText.trim())
    setNewCardText('')
  }

  function handleSaveTitle() {
    if (!editTitle.trim()) {
      return
    }

    onRenameColumn(column.id, editTitle.trim())
    setIsEditingTitle(false)
  }

  function handleCancelTitle() {
    setEditTitle(column.title)
    setIsEditingTitle(false)
  }

  return (
    <div className="column">
      {isEditingTitle ? (
        <div className="column-title-edit">
          <input
            type="text"
            value={editTitle}
            onChange={function (event) {
              setEditTitle(event.target.value)
            }}
            aria-label="Edit column title"
          />
          <button onClick={handleSaveTitle}>Save</button>
          <button onClick={handleCancelTitle}>Cancel</button>
        </div>
      ) : (
        <div className="column-header">
          <h2>{column.title}</h2>
          <div className="column-actions">
            <button onClick={function () { setIsEditingTitle(true) }}>Rename</button>
            <button onClick={function () { onDeleteColumn(column.id) }}>Delete</button>
          </div>
        </div>
      )}

      <Droppable droppableId={String(column.id)}>
        {function (provided) {
          return (
            <div
              className="card-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {column.cards.map(function (card, index) {
                return (
                  <Card
                    key={card.id}
                    card={card}
                    index={index}
                    onEditCard={onEditCard}
                    onDeleteCard={onDeleteCard}
                  />
                )
              })}
              {provided.placeholder}
            </div>
          )
        }}
      </Droppable>

      <form onSubmit={handleAddCard} className="add-card-form">
        <input
          type="text"
          value={newCardText}
          onChange={function (event) {
            setNewCardText(event.target.value)
          }}
          placeholder="Add a card"
          aria-label={'Add a card to ' + column.title}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}

export default Column