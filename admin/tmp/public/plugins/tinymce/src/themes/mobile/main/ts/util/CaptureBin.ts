import { Focus } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Css } from '@ephox/sugar';

const input = function (parent, operation) {
  // to capture focus allowing the keyboard to remain open with no 'real' selection
  const input = Element.fromTag('input');
  Css.setAll(input, {
    opacity: '0',
    position: 'absolute',
    top: '-1000px',
    left: '-1000px'
  });
  Insert.append(parent, input);

  Focus.focus(input);
  operation(input);
  Remove.remove(input);
};

export default {
  input
};