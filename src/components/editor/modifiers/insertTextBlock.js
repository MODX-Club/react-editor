
'use strict';

import {
  AtomicBlockUtils,
  EditorState,
} from 'draft-js';

// let count = 0;
// const examples = [
//   'select * from table where col = 3;',
//
//   '<p>\n' +
//   '    <span>some text</span>\n' +
//   '</p>',
//
//   'p{\n' +
//   ' color: red;\n' +
//   '}',
//
//   '// javascript\n' +
//   'class test extends test2{\n' +
//   '   function test(){\n' +
//   '     alert("sdfsdf")\n' +
//   '   }\n' +
//   '}'
// ];

export function insertTextBlock(editorState) {
  const contentState = editorState.getCurrentContent();
  // const nextFormula = count++ % examples.length;
  const contentStateWithEntity = contentState.createEntity(
    'TOKEN',
    'IMMUTABLE',
    {content: ''},
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(
    editorState,
    {currentContent: contentStateWithEntity}
  );
  return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
}
