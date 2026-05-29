/**
 * English translation table
 */

import { LocaleStrings } from './types';

export const enUS: LocaleStrings = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    info: 'Info',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
  },

  components: {
    button: {
      submit: 'Submit',
      reset: 'Reset',
      default: 'Button',
    },
    input: {
      placeholder: 'Please enter',
      required: 'Required',
      invalid: 'Invalid input',
    },
    modal: {
      title: 'Prompt',
      confirmDelete: 'Are you sure you want to delete?',
    },
    table: {
      empty: 'No data',
      noData: 'No data available',
      pageInfo: 'Page {page} of {total}',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      goToPage: 'Go to page',
    },
  },

  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Please enter at least {min} characters',
    maxLength: 'Please enter no more than {max} characters',
    pattern: 'Invalid format',
  },

  messages: {
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    loadingFailed: 'Loading failed',
    networkError: 'Network error',
  },
};

