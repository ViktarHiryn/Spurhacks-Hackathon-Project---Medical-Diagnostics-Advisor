# AI Doctor Frontend

A modern, responsive React application for the AI Doctor - Medical Diagnostics Advisor. This frontend provides a complete medical consultation experience with real-time video/audio analysis, document upload, medication tracking, and AI-powered health recommendations.

## Features

### 🩺 AI Doctor Chat Interface

- **Real-time Consultation**: Live chat with AI doctor avatar
- **Video Analysis**: Blink detection, facial expression analysis, and emotion recognition
- **Speech-to-Text**: Voice input with real-time transcription
- **Multi-modal Input**: Text, voice, and video data processing
- **Confidence Scoring**: AI provides confidence levels for diagnoses

### 📋 Health Task Management

- **Personalized Recommendations**: AI-generated health tasks based on consultation
- **Task Tracking**: Mark tasks as complete and track progress
- **Categorized Tasks**: Exercise, medication, lifestyle recommendations
- **Priority Levels**: High, medium, and low priority task classification

### 💊 Medication Tracker

- **Medication Management**: Add, edit, and remove medications
- **Expiry Tracking**: Alerts for expired or expiring medications
- **Stock Monitoring**: Low stock alerts and notifications
- **Pharmacy Finder**: Search nearby pharmacies with pricing and availability

### 📚 Medical History

- **Session History**: View past consultations and diagnoses
- **Detailed Records**: Access symptoms, recommendations, and analysis data
- **Search & Filter**: Find specific consultations by symptoms or diagnosis
- **Export Options**: Download consultation records

### 📄 Document Upload

- **Medical Documents**: Upload PDFs, images, and text files
- **Drag & Drop**: Easy file upload interface
- **Progress Tracking**: Real-time upload progress
- **Secure Processing**: Encrypted document handling

## Technology Stack

- **Frontend Framework**: React 18.2.0
- **Styling**: Tailwind CSS with custom medical theme
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context API with useReducer
- **API Communication**: Axios with Socket.IO for real-time features
- **Media Handling**: WebRTC for video/audio capture
- **Routing**: React Router DOM for navigation

## Color Scheme

The application uses a professional medical theme:

- **Primary**: Deep Blue (#0D47A1) - Trust and professionalism
- **Secondary**: Sky Blue (#1976D2) - Calm and reliability
- **Accent**: Amber (#FFC107) - Attention and warnings
- **Neutrals**: Clean grays for text and backgrounds

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Avatar.jsx              # AI doctor avatar with animations
│   │   ├── ChatInterface.jsx       # Main consultation interface
│   │   ├── DisclaimerModal.jsx     # Medical disclaimer modal
│   │   ├── DocumentUploader.jsx    # File upload component
│   │   ├── HistoryView.jsx         # Medical history display
│   │   ├── MedicationTracker.jsx   # Medication management
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   └── TaskList.jsx            # Health tasks display
│   ├── context/
│   │   └── UserContext.jsx         # Global state management
│   ├── hooks/
│   │   ├── useMediaStream.js       # Camera/microphone handling
│   │   └── useSTT.js               # Speech-to-text functionality
│   ├── api/
│   │   └── client.js               # API communication setup
│   ├── styles/
│   │   └── tailwind.css            # Tailwind CSS configuration
│   ├── App.jsx                     # Main application component
│   └── index.jsx                   # React entry point
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
└── package.json                    # Dependencies and scripts
```

## Key Components

### ChatInterface

The main consultation interface featuring:

- Animated AI avatar with state-based expressions
- Real-time video stream with vision analysis
- Speech-to-text input with interim results
- Message history with confidence scores
- Task and document management integration

### Avatar Component

Animated AI doctor avatar that responds to:

- Listening state (pulsing green)
- Processing state (rotating blue)
- Speaking state (animated mouth)
- Blink detection and eye movement

### MedicationTracker

Comprehensive medication management:

- Add/edit medication details
- Expiry date tracking with alerts
- Stock level monitoring
- Pharmacy search integration

### HistoryView

Medical history interface:

- Expandable consultation records
- Search and filter functionality
- Detailed symptom and recommendation display
- Export capabilities

## Usage

### Starting a Consultation

1. Accept the medical disclaimer
2. Enable camera and microphone permissions
3. Click the microphone button to start speaking
4. The AI will analyze your speech, video, and provide diagnosis
5. Review AI recommendations and generated tasks

### Managing Medications

1. Navigate to "Medications" in the sidebar
2. Click "Add Medication" to register new medications
3. Set expiry dates and stock levels
4. Receive alerts for expired or low-stock medications

### Uploading Documents

1. Click "Upload Document" in the chat interface
2. Drag and drop files or click to browse
3. Supported formats: PDF, JPEG, PNG, TXT, DOC, DOCX
4. Files are encrypted and securely processed

### Viewing History

1. Navigate to "Medical History" in the sidebar
2. Search by symptoms or diagnosis
3. Filter by consultation status
4. Expand sessions for detailed information

## Browser Compatibility

The application supports modern browsers with:

- WebRTC for media streaming
- Web Speech API for voice recognition
- Modern JavaScript features (ES6+)
- CSS Grid and Flexbox

**Recommended browsers:**

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Customization

- **Colors**: Modify `tailwind.config.js` for theme changes
- **Components**: Add new components in `src/components/`
- **API**: Update endpoints in `src/api/client.js`
- **Styling**: Extend styles in `src/styles/tailwind.css`

## Security Features

- Medical disclaimer and consent management
- Encrypted document upload and processing
- Secure API communication with JWT tokens
- Privacy-focused data handling
- Local storage for user preferences only

## Accessibility

The application includes:

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color ratios
- Semantic HTML structure
- Alternative text for images

## Performance Optimization

- Lazy loading of components
- Optimized image handling
- Efficient state management
- Minimal re-renders with React.memo
- Code splitting for reduced bundle size

## Contributing

1. Follow the existing code style and conventions
2. Add proper TypeScript types if converting to TypeScript
3. Test all functionality across different browsers
4. Ensure accessibility compliance
5. Update documentation for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions:

1. Check the browser console for errors
2. Verify camera/microphone permissions
3. Ensure backend API is running
4. Review network connectivity

## Future Enhancements

- **Mobile App**: React Native version
- **Offline Mode**: PWA capabilities
- **Multi-language**: Internationalization support
- **Advanced Analytics**: Health trend tracking
- **Integration**: EHR system connectivity
- **Wearables**: Fitness tracker integration

---

**Disclaimer**: This is a prototype application for educational and demonstration purposes. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.
