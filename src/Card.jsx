import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'

function Card({ card, index, onEditCard, onDeleteCard }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(card.text)

  function handleSave() {
    if (!editText.trim()) {
      return
    }

    onEditCard(card.id, editText.trim())
    setIsEditing(false)
  }

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {function (provided) {
        return (
          <div
            className="card"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {isEditing ? (
              <div className="card-edit">
                <input
                  type="text"
                  value={editText}
                  onChange={function (event) {
                    setEditText(event.target.value)
                  }}
                  aria-label="Edit card text"
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={function () { setIsEditing(false) }}>Cancel</button>
              </div>
            ) : (
              <div className="card-view">
                <span>{card.text}</span>
                <div className="card-actions">
                  <button onClick={function () { setIsEditing(true) }}>Edit</button>
                  <button onClick={function () { onDeleteCard(card.id) }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        )
      }}
    </Draggable>
  )
}

export default Card