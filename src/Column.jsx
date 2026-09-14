import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import Card from './Card'

function Column({ column, onAddCard, onEditCard, onDeleteCard }) {
  const [newCardText, setNewCardText] = useState('')

  function handleAddCard(event) {
    event.preventDefault()

    if (!newCardText.trim()) {
      return
    }

    onAddCard(column.id, newCardText.trim())
    setNewCardText('')
  }

  return (
    <div className="column">
      <h2>{column.title}</h2>

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