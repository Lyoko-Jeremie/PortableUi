/**
 * 简体中文翻译表
 */

import {LocaleStrings} from './types';

export const zhCN: LocaleStrings = {
  common: {
    ok: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    loading: '加载中...',
    error: '错误',
    warning: '警告',
    success: '成功',
    info: '信息',
    confirm: '确认',
    yes: '是',
    no: '否',
  },

  components: {
    button: {
      submit: '提交',
      reset: '重置',
      default: '按钮',
    },
    input: {
      placeholder: '请输入',
      required: '必填项',
      invalid: '输入无效',
    },
    modal: {
      title: '提示',
      confirmDelete: '确定要删除吗？',
    },
    table: {
      empty: '暂无数据',
      noData: '没有数据',
      pageInfo: '第 {page} 页，共 {total} 条',
    },
    pagination: {
      previous: '上一页',
      next: '下一页',
      goToPage: '跳转页码',
    },
  },

  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    minLength: '最少输入 {min} 个字符',
    maxLength: '最多输入 {max} 个字符',
    pattern: '输入格式不正确',
  },

  messages: {
    saveSuccess: '保存成功',
    deleteSuccess: '删除成功',
    loadingFailed: '加载失败',
    networkError: '网络错误',
  },
};

