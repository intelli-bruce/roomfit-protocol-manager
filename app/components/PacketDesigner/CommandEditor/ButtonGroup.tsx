import React from 'react';

interface ButtonGroupProps {
  onCancel: () => void;
  onSave: () => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({onCancel, onSave}) => {
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        취소
      </button>
      <button
        type="button"
        onClick={onSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        저장
      </button>
    </div>
  );
};

export default ButtonGroup;