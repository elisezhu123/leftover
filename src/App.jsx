import { useState, useCallback, useRef, useEffect } from 'react'
import 'boxicons/css/boxicons.min.css'
import './App.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [mealType, setMealType] = useState('breakfast')
  const [dayOfWeek, setDayOfWeek] = useState('Monday')
  const [mealImages, setMealImages] = useState([])
  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const fileReader = new FileReader()
      fileReader.onload = (e) => {
        setPreviewUrl(e.target?.result)
      }
      fileReader.readAsDataURL(file)
    }
  }, [])

  const handleUpload = useCallback(() => {
    if (selectedFile && previewUrl) {
      const newMealImage = {
        id: Date.now().toString(),
        mealType,
        dayOfWeek,
        imageUrl: previewUrl,
        timestamp: new Date(),
      }
      setMealImages(prev => [...prev, newMealImage])
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }, [selectedFile, previewUrl, mealType, dayOfWeek])

  const cleanupOldImages = useCallback(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    setMealImages(prevImages => prevImages.filter(img => img.timestamp > oneWeekAgo));
  }, []);

  useEffect(() => {
    const cleanup = setInterval(cleanupOldImages, 24 * 60 * 60 * 1000); // Run daily
    return () => clearInterval(cleanup);
  }, [cleanupOldImages]);

  const triggerCameraInput = () => {
    cameraInputRef.current?.click()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="container">
      <div className="meal-tracker">
        <div className="card">
          <h2 className="card-title">Remaining Portions</h2>
          <div className="card-content">
            <form className="form">
              <div className="form-group">
                <label htmlFor="meal-type">Meal Type</label>
                <select 
                  id="meal-type" 
                  value={mealType} 
                  onChange={(e) => setMealType(e.target.value)}
                  className="select-input"
                >
                  {MEAL_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="day-of-week">Day of Week</label>
                <select 
                  id="day-of-week" 
                  value={dayOfWeek} 
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="select-input"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="button-group">
                  <button type="button" onClick={triggerCameraInput} className="btn">
                    <i className="bx bx-camera"></i>
                    Take Photo
                  </button>
                  <button type="button" onClick={triggerFileInput} className="btn btn-outline">
                    <i className="bx bx-image"></i>
                    Choose Pictures
                  </button>
                </div>
              </div>

              {previewUrl && (
                <div className="preview">
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleUpload} 
                disabled={!selectedFile}
                type="button"
              >
                Save and Upload
              </button>
            </form>
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => setDayOfWeek(day)}
                className={`tab-button ${day === dayOfWeek ? 'active' : ''}`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="card">
              <h3 className="card-title">{dayOfWeek}'s Leftover</h3>
              <div className="card-content">
                <div className="meals-grid">
                  {MEAL_TYPES.map((type) => (
                    <div key={type} className="meal-section">
                      <h4 className="meal-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                      <div className="meal-images">
                        {mealImages
                          .filter((img) => img.mealType === type && img.dayOfWeek === dayOfWeek)
                          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                          .map((img) => (
                            <div key={img.id} className="meal-image-container">
                              <img 
                                src={img.imageUrl} 
                                alt={`${img.mealType} leftover for ${img.dayOfWeek}`} 
                                className="meal-image" 
                              />
                              <p className="meal-time">
                                {img.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

