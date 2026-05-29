/**
 * 语言文件的类型定义
 * 用于提供 TypeScript 类型安全的翻译查找
 */

export interface LocaleStrings {
  // Common
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    loading: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    confirm: string;
    yes: string;
    no: string;
  };

  // Components
  components: {
    button: {
      submit: string;
      reset: string;
      default: string;
    };
    input: {
      placeholder: string;
      required: string;
      invalid: string;
    };
    modal: {
      title: string;
      confirmDelete: string;
    };
    table: {
      empty: string;
      noData: string;
      pageInfo: string;
    };
    pagination: {
      previous: string;
      next: string;
      goToPage: string;
    };
  };

  // Validation
  validation: {
    required: string;
    email: string;
    minLength: string;
    maxLength: string;
    pattern: string;
  };

  // Messages
  messages: {
    saveSuccess: string;
    deleteSuccess: string;
    loadingFailed: string;
    networkError: string;
  };
}

