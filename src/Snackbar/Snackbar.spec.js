// @flow

import React from 'react';
import { assert } from 'chai';
import { spy, useFakeTimers } from 'sinon';
import { createShallow, createMount, getClasses } from '../test-utils';
import Snackbar from './Snackbar';
import Slide from '../transitions/Slide';

describe('<Snackbar />', () => {
  let shallow;
  let mount;
  let classes;

  before(() => {
    shallow = createShallow({ dive: true });
    classes = getClasses(<Snackbar open />);
    mount = createMount();
  });

  after(() => {
    mount.cleanUp();
  });

  it('should render a EventListener with classes', () => {
    const wrapper = shallow(<Snackbar open message="message" />);
    assert.strictEqual(wrapper.name(), 'EventListener');
    assert.strictEqual(
      wrapper
        .childAt(0)
        .childAt(0)
        .hasClass(classes.root),
      true,
      'should have the root class',
    );
    assert.strictEqual(wrapper.find(Slide).length, 1, 'should use a Slide by default');
  });

  describe('prop: onClose', () => {
    it('should be call when clicking away', () => {
      const handleClose = spy();
      mount(<Snackbar open onClose={handleClose} message="message" />);

      const event = new window.Event('mouseup', { view: window, bubbles: true, cancelable: true });
      window.document.body.dispatchEvent(event);

      assert.strictEqual(handleClose.callCount, 1);
      assert.deepEqual(handleClose.args[0], [event, 'clickaway']);
    });
  });

  describe('prop: autoHideDuration', () => {
    let clock;

    before(() => {
      clock = useFakeTimers();
    });

    after(() => {
      clock.restore();
    });

    it('should call onClose when the timer is done', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      const wrapper = mount(
        <Snackbar
          open={false}
          onClose={handleClose}
          message="message"
          autoHideDuration={autoHideDuration}
        />,
      );

      wrapper.setProps({ open: true });
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration);
      assert.strictEqual(handleClose.callCount, 1);
      assert.deepEqual(handleClose.args[0], [null, 'timeout']);
    });

    it('should not call onClose when the autoHideDuration is reset', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      const wrapper = mount(
        <Snackbar
          open={false}
          onClose={handleClose}
          message="message"
          autoHideDuration={autoHideDuration}
        />,
      );

      wrapper.setProps({ open: true });
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration / 2);
      wrapper.setProps({ autoHideDuration: undefined });
      clock.tick(autoHideDuration / 2);
      assert.strictEqual(handleClose.callCount, 0);
    });

    it('should be able to interrupt the timer', () => {
      const handleMouseEnter = spy();
      const handleMouseLeave = spy();
      const handleClose = spy();
      const autoHideDuration = 2e3;
      const wrapper = mount(
        <Snackbar
          open
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClose={handleClose}
          message="message"
          autoHideDuration={autoHideDuration}
        />,
      );

      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration / 2);
      wrapper.simulate('mouseEnter');
      assert.strictEqual(handleMouseEnter.callCount, 1, 'should trigger mouse enter callback');
      clock.tick(autoHideDuration / 2);
      wrapper.simulate('mouseLeave');
      assert.strictEqual(handleMouseLeave.callCount, 1, 'should trigger mouse leave callback');
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(2e3);
      assert.strictEqual(handleClose.callCount, 1);
      assert.deepEqual(handleClose.args[0], [null, 'timeout']);
    });

    it('should not call onClose if autoHideDuration is undefined', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      mount(<Snackbar open onClose={handleClose} message="message" autoHideDuration={undefined} />);

      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration);
      assert.strictEqual(handleClose.callCount, 0);
    });

    it('should not call onClose if autoHideDuration is null', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      mount(<Snackbar open onClose={handleClose} message="message" autoHideDuration={null} />);

      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration);
      assert.strictEqual(handleClose.callCount, 0);
    });

    it('should not call onClose when closed', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      const wrapper = mount(
        <Snackbar
          open
          onClose={handleClose}
          message="message"
          autoHideDuration={autoHideDuration}
        />,
      );

      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration / 2);
      wrapper.setProps({ open: false });
      clock.tick(autoHideDuration / 2);
      assert.strictEqual(handleClose.callCount, 0);
    });
  });

  describe('prop: resumeHideDuration', () => {
    let clock;

    before(() => {
      clock = useFakeTimers();
    });

    after(() => {
      clock.restore();
    });

    it('should not call onClose with not timeout after user interaction', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      const resumeHideDuration = 3e3;
      const wrapper = mount(
        <Snackbar
          open
          onClose={handleClose}
          message="message"
          autoHideDuration={autoHideDuration}
          resumeHideDuration={resumeHideDuration}
        />,
      );
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration / 2);
      wrapper.simulate('mouseEnter');
      clock.tick(autoHideDuration / 2);
      wrapper.simulate('mouseLeave');
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(2e3);
      assert.strictEqual(handleClose.callCount, 0);
    });

    it('should call onClose when timer done after user interaction', () => {
      const handleClose = spy();
      const autoHideDuration = 2e3;
      const resumeHideDuration = 3e3;
      const wrapper = mount(
        <Snackbar
          open
          onClose={handleClose}
          message="message"
          autoHideDuration={autoHideDuration}
          resumeHideDuration={resumeHideDuration}
        />,
      );
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(autoHideDuration / 2);
      wrapper.simulate('mouseEnter');
      clock.tick(autoHideDuration / 2);
      wrapper.simulate('mouseLeave');
      assert.strictEqual(handleClose.callCount, 0);
      clock.tick(resumeHideDuration);
      assert.strictEqual(handleClose.callCount, 1);
      assert.deepEqual(handleClose.args[0], [null, 'timeout']);
    });
  });

  describe('prop: open', () => {
    it('should not render anything when closed', () => {
      const wrapper = shallow(<Snackbar open={false} message="" />);
      assert.strictEqual(wrapper.type(), null);
    });

    it('should be able show it after mounted', () => {
      const wrapper = shallow(<Snackbar open={false} message="" />);
      assert.strictEqual(wrapper.type(), null);
      wrapper.setProps({ open: true });
      assert.strictEqual(wrapper.find(Slide).length, 1, 'should use a Slide by default');
    });
  });

  describe('prop: children', () => {
    it('should render the children', () => {
      const children = <div />;
      const wrapper = shallow(<Snackbar open>{children}</Snackbar>);
      assert.strictEqual(wrapper.contains(children), true);
    });
  });

  describe('prop: transition', () => {
    it('should render a Snackbar with transition', () => {
      const Transition = props => <div className="cloned-element-class" {...props} />;
      const wrapper = shallow(<Snackbar open transition={Transition} />);
      assert.strictEqual(
        wrapper.find(Transition).length,
        1,
        'should include element given in transition',
      );
    });
  });
});
