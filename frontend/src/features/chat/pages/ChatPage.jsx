import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChat, sendMessage, updateChatTitle, deleteChat } from '../services/chatService';
import { getSteps, getCurrentStep, completeStep, uncompleteStep } from '../services/stepService';
import { generateHistory } from '../../histories/services/historiesService';
import { isAuthenticated } from '../../auth/services/authService';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import ChatInputForm from '../components/ChatInputForm';
import CurrentStepCard from '../components/CurrentStepCard';
import ImageModal from '../components/ImageModal';
import TypingIndicator from '../components/TypingIndicator';
import './ChatPage.css';

function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [generatingHistory, setGeneratingHistory] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const [steps, setSteps] = useState([]);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchChat();
  }, [chatId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load authenticated images
  useEffect(() => {
    const loadImages = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || messages.length === 0) return;

      const messagesToUpdate = [];
      
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.has_image && message.image_url && !message.image_url.startsWith('blob:')) {
          messagesToUpdate.push({ index: i, message });
        }
      }

      if (messagesToUpdate.length === 0) return;

      const updatedMessages = [...messages];
      
      for (const { index, message } of messagesToUpdate) {
        try {
          const imageUrl = message.image_url.startsWith('/') 
            ? `${import.meta.env.VITE_API_URL}${message.image_url}`
            : message.image_url;
          
          const response = await fetch(imageUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            updatedMessages[index] = { ...message, image_url: blobUrl };
          }
        } catch (error) {
          console.error('Error loading image:', error);
        }
      }

      setMessages(updatedMessages);
    };

    loadImages();
  }, [messages.length]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      setError('');
      const chatData = await getChat(chatId);
      setChat(chatData);
      setMessages(chatData.messages || []);
      
      console.log('📋 Chat data loaded:', chatData);
      console.log('📄 Has template?', chatData.instruction_template_filename);
      
      // Fetch current step if chat has template
      if (chatData.instruction_template_filename) {
        console.log('🔍 Fetching current step for chat', chatId);
        try {
          const step = await getCurrentStep(chatId);
          console.log('✅ Current step fetched:', step);
          setCurrentStep(step);
          
          // Also fetch all steps to know if we can go back
          const allSteps = await getSteps(chatId);
          console.log('📋 All steps fetched:', allSteps);
          setSteps(allSteps.steps || []);
        } catch (err) {
          console.log('❌ No current step or error fetching step:', err);
        }
      } else {
        console.log('⚠️ No template filename, skipping step fetch');
      }
    } catch (err) {
      setError('Error al cargar la conversación');
      console.error('Error fetching chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen es demasiado grande (máximo 10MB)');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!inputMessage.trim() && !selectedImage) || sending) return;

    const userMessageContent = inputMessage.trim() || '(Imagen adjunta)';
    const imageToSend = selectedImage;
    
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setSending(true);

    const userMessage = {
      role: 'user',
      content: userMessageContent,
      has_image: !!imageToSend,
      image_url: imageToSend ? URL.createObjectURL(imageToSend) : null,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await sendMessage(chatId, userMessageContent, imageToSend);
      
      if (userMessage.image_url?.startsWith('blob:')) {
        URL.revokeObjectURL(userMessage.image_url);
      }
      
      setMessages(prev => {
        const withoutTemp = prev.slice(0, -1);
        return [...withoutTemp, response.user_message, response.ai_message];
      });
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditTitle = () => {
    setEditedTitle(chat?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === chat?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateChatTitle(chatId, editedTitle.trim());
      setChat(prev => ({ ...prev, title: editedTitle.trim() }));
      setIsEditingTitle(false);
    } catch (err) {
      setError('Error al actualizar el título');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleGenerateHistory = async () => {
    console.log('🔍 handleGenerateHistory called');
    console.log('Messages count:', messages.length);
    
    if (messages.length < 2) {
      alert('⚠️ El chat debe tener al menos 1 intercambio (2 mensajes) para generar un histórico.\n\nMensajes actuales: ' + messages.length + '\nMensajes necesarios: 2');
      console.log('❌ Not enough messages');
      return;
    }

    const confirmed = window.confirm(
      '¿Generar histórico de mantenimiento de esta conversación? La IA creará un resumen con las acciones realizadas.'
    );
    
    console.log('User confirmed:', confirmed);
    if (!confirmed) return;

    try {
      setGeneratingHistory(true);
      setError('');
      console.log('📡 Calling generateHistory API with chatId:', chatId);
      const result = await generateHistory(chatId);
      console.log('✅ History generated successfully:', result);
      alert(`Histórico generado exitosamente. Puedes verlo en la sección de Históricos.`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al generar el histórico';
      setError(errorMsg);
      console.error('❌ Error generating history:', err);
    } finally {
      setGeneratingHistory(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) return;

    try {
      await deleteChat(chatId);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al eliminar la conversación');
      setShowSettingsMenu(false);
    }
  };

  const handleCompleteStep = async () => {
    if (!currentStep || isCompletingStep) return;

    setIsCompletingStep(true);
    try {
      await completeStep(chatId, currentStep.id);
      
      // Refresh steps list to update hasPreviousStep calculation
      const updatedSteps = await getSteps(chatId);
      setSteps(updatedSteps.steps || []);
      
      // Fetch next step
      const nextStep = await getCurrentStep(chatId);
      setCurrentStep(nextStep);
      
      if (nextStep) {
        // Show success message
        setError('');
      } else {
        // All steps completed
        alert('¡Felicidades! Has completado todos los pasos del procedimiento.');
      }
    } catch (err) {
      setError('Error al completar el paso');
      console.error('Error completing step:', err);
    } finally {
      setIsCompletingStep(false);
    }
  };

  const handlePreviousStep = async () => {
    if (!currentStep || isGoingBack) return;

    setIsGoingBack(true);
    try {
      // Find previous completed step
      const previousStep = steps
        .filter(s => s.is_completed && s.step_number < currentStep.step_number)
        .sort((a, b) => b.step_number - a.step_number)[0];
      
      if (previousStep) {
        await uncompleteStep(chatId, previousStep.id);
        
        // Refresh steps
        const updatedSteps = await getSteps(chatId);
        setSteps(updatedSteps.steps || []);
        
        // Get new current step
        const newCurrent = await getCurrentStep(chatId);
        setCurrentStep(newCurrent);
        
        setError('');
      }
    } catch (err) {
      setError('Error al retroceder al paso anterior');
      console.error('Error going back:', err);
    } finally {
      setIsGoingBack(false);
    }
  };


  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-chat">
          <div className="loading-spinner"></div>
          <p>Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (error && !chat) {
    return (
      <div className="chat-page">
        <div className="error-chat">
          <p>{error}</p>
          <Link to="/dashboard" className="back-button">Volver al Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <ChatHeader
        chat={chat}
        isEditingTitle={isEditingTitle}
        editedTitle={editedTitle}
        setEditedTitle={setEditedTitle}
        onEditTitle={handleEditTitle}
        onSaveTitle={handleSaveTitle}
        onCancelEdit={handleCancelEdit}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        onDeleteChat={handleDeleteChat}
        onGenerateHistory={handleGenerateHistory}
        generatingHistory={generatingHistory}
      />

      {currentStep && (
        <div className="step-card-fixed-wrapper">
          <CurrentStepCard 
            step={currentStep} 
            onComplete={handleCompleteStep}
            onPrevious={handlePreviousStep}
            hasPreviousStep={currentStep.step_number > 1}
            isCompleting={isCompletingStep}
            isGoingBack={isGoingBack}
          />
        </div>
      )}

      <div className="chat-container" style={{ paddingTop: currentStep ? '220px' : '100px' }}>
        <div className="messages-container">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              formatTime={formatTime}
              onImageClick={setModalImage}
            />
          ))}
          
          {sending && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="error-message-dashboard" style={{ margin: '0 1rem' }}>
          {error}
        </div>
      )}

      <ChatInputForm
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        sending={sending}
        selectedImage={selectedImage}
        imagePreview={imagePreview}
        onImageSelect={handleImageSelect}
        onRemoveImage={handleRemoveImage}
        onSend={handleSendMessage}
      />

      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
}

export default ChatPage;
