import {Protocol, ProtocolAction} from '@/lib/types';
import {generateId} from '@/lib/initialState';

// 프로토콜 리듀서 함수
export function protocolReducer(state: Protocol, action: ProtocolAction): Protocol {
  switch (action.type) {
    case 'UPDATE_PROTOCOL_INFO':
      return {
        ...state,
        ...(action.payload.name && {name: action.payload.name}),
        ...(action.payload.version && {version: action.payload.version}),
        lastModified: new Date().toISOString()
      };

    case 'ADD_BASE_FIELD': {
      const newField = {
        id: generateId(),
        ...action.payload
      };

      return {
        ...state,
        basePacket: {
          ...state.basePacket,
          fields: [...state.basePacket.fields, newField]
        },
        lastModified: new Date().toISOString()
      };
    }

    case 'UPDATE_BASE_FIELD':
      return {
        ...state,
        basePacket: {
          ...state.basePacket,
          fields: state.basePacket.fields.map(field =>
            field.id === action.payload.id ? {...field, ...action.payload.field} : field
          )
        },
        lastModified: new Date().toISOString()
      };

    case 'REMOVE_BASE_FIELD':
      return {
        ...state,
        basePacket: {
          ...state.basePacket,
          fields: state.basePacket.fields.filter(field => field.id !== action.payload)
        },
        lastModified: new Date().toISOString()
      };

    case 'ADD_CATEGORY': {
      const newCategory: CommandCategory = {
        id: generateId(),
        commands: [],
        ...action.payload
      };

      return {
        ...state,
        categories: [...state.categories, newCategory],
        lastModified: new Date().toISOString()
      };
    }

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id
            ? {...category, ...action.payload.category}
            : category
        ),
        lastModified: new Date().toISOString()
      };

    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        lastModified: new Date().toISOString()
      };

    case 'ADD_COMMAND': {
      const newCommand = {
        id: generateId(),
        ...action.payload.command
      };

      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
              ...category,
              commands: [
                ...category.commands,
                newCommand
              ]
            }
            : category
        ),
        lastModified: new Date().toISOString()
      };
    }

    case 'UPDATE_COMMAND':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
              ...category,
              commands: category.commands.map(command =>
                command.id === action.payload.id
                  ? {...command, ...action.payload.command}
                  : command
              )
            }
            : category
        ),
        lastModified: new Date().toISOString()
      };

    case 'REMOVE_COMMAND':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
              ...category,
              commands: category.commands.filter(command => command.id !== action.payload.commandId)
            }
            : category
        ),
        lastModified: new Date().toISOString()
      };

    case 'ADD_HISTORY_ENTRY': {
      const newEntry = {
        id: state.history.length + 1,
        timestamp: new Date().toISOString(),
        ...action.payload,
        snapshot: {...state}
      };

      return {
        ...state,
        history: [...state.history, newEntry]
      };
    }

    case 'RESTORE_VERSION': {
      const historyEntry = state.history.find(entry => entry.id === action.payload);
      if (historyEntry?.snapshot) {
        return {
          ...historyEntry.snapshot,
          history: state.history,
          lastModified: new Date().toISOString()
        };
      }
      return state;
    }

    case 'IMPORT_PROTOCOL':
      return {
        ...action.payload,
        history: [
          ...state.history,
          {
            id: state.history.length + 1,
            timestamp: new Date().toISOString(),
            description: `프로토콜 가져오기: ${action.payload.name} v${action.payload.version}`
          }
        ],
        lastModified: new Date().toISOString()
      };

    default:
      return state;
  }
}

// Command Category 타입 임시 정의 (타입 에러 방지용)
interface CommandCategory {
  id: string;
  name: string;
  description: string;
  commands: any[];
}