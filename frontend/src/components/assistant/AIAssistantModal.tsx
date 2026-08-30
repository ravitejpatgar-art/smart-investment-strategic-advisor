import React from 'react';
import { AIAssistantDrawer } from './AIAssistantDrawer';

interface AIAssistantModalProps {
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose }) => {
  return <AIAssistantDrawer onClose={onClose} />;
};
