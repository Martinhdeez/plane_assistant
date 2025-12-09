import { useState, useEffect, useRef } from 'react';

export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check if browser supports Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);

            // Initialize recognition
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES'; // Spanish
            recognition.continuous = true; // Keep listening for pauses
            recognition.interimResults = false; // Only final results
            recognition.maxAlternatives = 1;

            let speechTimeout;
            let finalTranscript = '';

            // Event handlers
            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
                finalTranscript = '';
            };

            recognition.onresult = (event) => {
                // Clear previous timeout
                if (speechTimeout) {
                    clearTimeout(speechTimeout);
                }

                // Collect all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }

                // Set timeout to stop after 2 seconds of silence
                speechTimeout = setTimeout(() => {
                    if (recognition && finalTranscript.trim()) {
                        recognition.stop();
                    }
                }, 2000); // 2 seconds of silence before stopping
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setError(event.error);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (finalTranscript.trim()) {
                    setTranscript(finalTranscript.trim());
                }
                if (speechTimeout) {
                    clearTimeout(speechTimeout);
                }
            };

            recognitionRef.current = recognition;
        } else {
            setIsSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Error starting recognition:', err);
                setError('Error al iniciar el reconocimiento de voz');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    };

    return {
        isListening,
        transcript,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript
    };
};

export default useVoiceRecognition;
