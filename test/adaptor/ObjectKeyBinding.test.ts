import {describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import {App} from '../src/adaptor/App';

describe('ObjectKeyBinding with zone.js dirty detection', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = 'test-app';
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('should support markDirty(target, key) for object-level bindings', () => {
    const userData = {profile: {name: 'Alice'}};

    const app = new App(host, {
      bindingOptions: {
        flush: 'microtask',
        zoneAutoDirty: false,
      },
    });

    const input = app.addInput({
      id: 'nameInput',
      bind: {
        value: {
          target: userData,
          key: 'profile.name',
          detect: 'manual',
        } as any,
      },
    });

    expect(input.getValue()).toBe('Alice');

    userData.profile.name = 'Bob';
    app.markDirty(userData, 'profile.name');

    return Promise.resolve().then(() => {
      expect(input.getValue()).toBe('Bob');
      app.destroy();
    });
  });

  it('should support markDirtyAll(target) for full object refresh', () => {
    const userData = {
      name: 'Carol',
      email: 'carol@example.com',
    };

    const app = new App(host);

    const nameInput = app.addInput({
      id: 'name',
      bind: {
        value: {
          target: userData,
          key: 'name',
        } as any,
      },
    });

    const emailInput = app.addInput({
      id: 'email',
      bind: {
        value: {
          target: userData,
          key: 'email',
        } as any,
      },
    });

    expect(nameInput.getValue()).toBe('Carol');
    expect(emailInput.getValue()).toBe('carol@example.com');

    userData.name = 'Dave';
    userData.email = 'dave@example.com';
    app.markDirtyAll(userData);

    return Promise.resolve().then(() => {
      expect(nameInput.getValue()).toBe('Dave');
      expect(emailInput.getValue()).toBe('dave@example.com');
      app.destroy();
    });
  });

  it('should support writeback on input events', () => {
    const userData = {name: 'Eve'};

    const app = new App(host);

    const input = app.addInput({
      id: 'nameInput',
      bind: {
        value: {
          target: userData,
          key: 'name',
          detect: 'manual',
        } as any,
      },
    });

    expect(userData.name).toBe('Eve');
    expect(input.getValue()).toBe('Eve');

    app.destroy();
  });
});


