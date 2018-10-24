/**
 * Copyright (c) 2013-present, Facebook, Inc. All rights reserved.
 *
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {convertFromRaw} from 'draft-js';

var rawContent = {
  blocks: [
    {
      text: '',
      type: 'unstyled',
    },
    // {
    //   text: '// php\n' +
    //   'class test extends test2{\n' +
    //   '   public function test(){\n' +
    //   '     print "sdfsdf";\n' +
    //   '   }\n' +
    //   '}',
    //   type: 'unstyled',
    // },
    // {
    //   text: '// javascript\n' +
    //   'class test extends test2{\n' +
    //   '   function test(){\n' +
    //   '     alert("sdfsdf")\n' +
    //   '   }\n' +
    //   '}',
    //   type: 'unstyled',
    // },

    // {
    //   text: ' ',
    //   type: 'atomic',
    //   entityRanges: [{offset: 0, length: 1, key: 'sql'}],
    // },
    // {
    //   text: 'Click any TeX block to edit.',
    //   type: 'unstyled',
    // },
    // {
    //   text: ' ',
    //   type: 'atomic',
    //   entityRanges: [{offset: 0, length: 1, key: 'first'}],
    // },
    // {
    //   text: 'You can also insert a new TeX block at the cursor location.',
    //   type: 'unstyled',
    // },
  ],

  entityMap: {
    // sql: {
    //   type: 'TOKEN',
    //   mutability: 'IMMUTABLE',
    //   data: {
    //     content: (
    //       '// javascript\n' +
    //       'class test extends test2{\n' +
    //       '   function test(){\n' +
    //       '     alert("sdfsdf")\n' +
    //       '   }\n' +
    //       '}'
    //     ),
    //   },
    // },
    // first: {
    //   type: 'TOKEN',
    //   mutability: 'IMMUTABLE',
    //   data: {
    //     content: (
    //       '// javascript\n' +
    //       'class test extends test2{\n' +
    //       '   function test(){\n' +
    //       '     alert("sdfsdf")\n' +
    //       '   }\n' +
    //       '}'
    //     ),
    //   },
    // },
  },
};

export var content = convertFromRaw(rawContent);
