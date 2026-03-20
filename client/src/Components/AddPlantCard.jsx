import { BsPlusCircle } from 'react-icons/bs'

export default function AddPlantCard({ onClick }) {
  return (
    <div className="add-plant-card" onClick={onClick}>
      <div className="add-plant-icon">
        <BsPlusCircle size={32} />
      </div>
      <p className="add-plant-title">Add New Plant</p>
      <p className="add-plant-subtitle">Add a plant to your garden</p>
    </div>
  )
}