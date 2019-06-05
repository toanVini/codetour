import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Hierarchy } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import CefDeleteAction from 'tinymce/core/delete/CefDeleteAction';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.CefDeleteActionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const viewBlock = ViewBlock();

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cReadAction = function (forward, cursorPath, cursorOffset) {
    return Chain.mapper(function (viewBlock) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), cursorPath).getOrDie();
      const rng = document.createRange();
      rng.setStart(container.dom(), cursorOffset);
      rng.setEnd(container.dom(), cursorOffset);
      return CefDeleteAction.read(viewBlock.get(), forward, rng);
    });
  };

  const cAssertRemoveElementAction = function (elementPath) {
    return Chain.op(function (actionOption) {
      const element = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
      const action = actionOption.getOrDie();
      Assertions.assertEq('Should be expected action type', 'remove', actionName(action));
      Assertions.assertDomEq('Should be expected element', element, actionValue(action));
    });
  };

  const cAssertMoveToElementAction = function (elementPath) {
    return Chain.op(function (actionOption) {
      const element = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
      const action = actionOption.getOrDie();
      Assertions.assertEq('Should be expected action type', 'moveToElement', actionName(action));
      Assertions.assertDomEq('Should be expected element', element, actionValue(action));
    });
  };

  const cAssertMoveToPositionAction = function (elementPath, offset) {
    return Chain.op(function (actionOption) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
      const action = actionOption.getOrDie();
      Assertions.assertEq('Should be expected action type', 'moveToPosition', actionName(action));
      Assertions.assertDomEq('Should be expected container', container, Element.fromDom(actionValue(action).container()));
      Assertions.assertEq('Should be expected offset', offset, actionValue(action).offset());
    });
  };

  const cAssertActionNone = Chain.op(function (actionOption) {
    Assertions.assertEq('Action value should be none', true, actionOption.isNone());
  });

  const actionName = function (action) {
    return action.fold(
      Fun.constant('remove'),
      Fun.constant('moveToElement'),
      Fun.constant('moveToPosition')
    );
  };

  const actionValue = function (action) {
    return action.fold(
      Element.fromDom,
      Element.fromDom,
      Fun.identity
    );
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('None actions where caret is not near a cef element', GeneralSteps.sequence([
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cReadAction(true, [0, 0], 0),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cReadAction(false, [0, 0], 0),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cReadAction(true, [0, 0], 1),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cReadAction(false, [0, 0], 1),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
        cReadAction(true, [0, 0], 0),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
        cReadAction(false, [0, 0], 0),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p>b</p>'),
        cReadAction(true, [1, 0], 1),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p>b</p>'),
        cReadAction(false, [1, 0], 1),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it is after the last ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
        cReadAction(true, [], 2),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it is before the first ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
        cReadAction(false, [], 0),
        cAssertActionNone
      ]))
    ])),

    Logger.t('MoveToElement actions where caret is near a cef element', GeneralSteps.sequence([
      Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
        cReadAction(true, [0, 0], 1),
        cAssertMoveToElementAction([1])
      ])),
      Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p>a</p>'),
        cReadAction(false, [1, 0], 0),
        cAssertMoveToElementAction([0])
      ])),
      Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p><em>a</em></p><p contenteditable="false">b</p>'),
        cReadAction(true, [0, 0, 0], 1),
        cAssertMoveToElementAction([1])
      ])),
      Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p><em>a</em></p>'),
        cReadAction(false, [1, 0, 0], 0),
        cAssertMoveToElementAction([0])
      ])),
      Logger.t('Should be moveToElement since it is delete after ce=false before another ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="after"><br></p><p contenteditable="false">b</p>'),
        cReadAction(true, [1], 0),
        cAssertMoveToElementAction([2])
      ])),
      Logger.t('Should be moveToElement since it is backspace before a ce=false element before a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="before"><br></p><p contenteditable="false">b</p>'),
        cReadAction(false, [1], 0),
        cAssertMoveToElementAction([0])
      ]))
    ])),

    Logger.t('RemoveElement actions where caret is near a cef element', GeneralSteps.sequence([
      Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
        cReadAction(true, [], 0),
        cAssertRemoveElementAction([0])
      ])),
      Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
        cReadAction(true, [], 1),
        cAssertRemoveElementAction([1])
      ])),
      Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
        cReadAction(false, [], 2),
        cAssertRemoveElementAction([1])
      ])),
      Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
        cReadAction(false, [], 1),
        cAssertRemoveElementAction([0])
      ])),
      Logger.t('Should be removeElement since it is backspace after a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="after"><br></p><p contenteditable="false">b</p>'),
        cReadAction(false, [1], 0),
        cAssertRemoveElementAction([0])
      ])),
      Logger.t('Should be removeElement since it is delete before a ce=false', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="before"><br></p><p contenteditable="false">b</p>'),
        cReadAction(true, [1], 0),
        cAssertRemoveElementAction([2])
      ])),
      Logger.t('Should be removeElement since the block you are deleting from is empty', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p><br></p><p contenteditable="false">b</p>'),
        cReadAction(true, [1], 0),
        cAssertRemoveElementAction([1])
      ])),
      Logger.t('Should be removeElement since the block you are deleting from is empty', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">b</p><p><br></p><p contenteditable="false">b</p>'),
        cReadAction(false, [1], 0),
        cAssertRemoveElementAction([1])
      ]))
    ])),

    Logger.t('moveToPosition actions where caret is to be moved from cef to normal content between blocks', GeneralSteps.sequence([
      Logger.t('Should be moveToPosition action since we are after a ce=false and moving forwards to normal content', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p><p>b</p>'),
        cReadAction(true, [], 1),
        cAssertMoveToPositionAction([1, 0], 0)
      ])),
      Logger.t('Should be moveToPosition action since we are before a ce=false and moving backwards to normal content', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
        cReadAction(false, [], 1),
        cAssertMoveToPositionAction([0, 0], 1)
      ]))
    ])),

    Logger.t('Delete after inline cef should not do anything', GeneralSteps.sequence([
      Logger.t('Should be no action since it is a delete after cef to text', Chain.asStep(viewBlock, [
        cSetHtml('<p><b contenteditable="false">a</b>b</p>'),
        cReadAction(true, [0], 1),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it is a delete after cef to no position', Chain.asStep(viewBlock, [
        cSetHtml('<p><b contenteditable="false">a</b></p>'),
        cReadAction(true, [0], 1),
        cAssertActionNone
      ]))
    ])),

    Logger.t('Backspace before inline cef should not do anything', GeneralSteps.sequence([
      Logger.t('Should be no action since it is a backspace before cef to text', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<b contenteditable="false">b</b></p>'),
        cReadAction(false, [0, 0], 1),
        cAssertActionNone
      ])),
      Logger.t('Should be no action since it is a backspace before cef to no position', Chain.asStep(viewBlock, [
        cSetHtml('<p><b contenteditable="false">a</b></p>'),
        cReadAction(false, [0], 0),
        cAssertActionNone
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
