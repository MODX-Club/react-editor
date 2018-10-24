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

'use strict';

import '../../styles/less/styles.css';

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import Draft from 'draft-js';
// import removeRangeFromContentState from 'draft-js/lib/removeRangeFromContentState';


import { Map, List } from 'immutable';


import Button from 'material-ui/Button';
import TextBlock from './TextBlock';
import ImageBlock from './blocks/image';

import md5 from 'md5';


import { insertTextBlock } from './modifiers/insertTextBlock';
import { removeTextBlock } from './modifiers/removeTextBlock';



import IconButton from 'material-ui/IconButton';

import Bold from 'material-ui-icons/FormatBold';
import Italic from 'material-ui-icons/FormatItalic';
import Underlined from 'material-ui-icons/FormatUnderlined';
import Code from 'material-ui-icons/Code';
import Send from 'material-ui-icons/Send';
import WaitIcon from 'material-ui-icons/HourglassEmpty';
import Create from 'material-ui-icons/Create';


var Immutable = require('immutable');
const URI = require('fbjs/lib/URI');
// var DraftEntity = require('draft-js/lib/DraftEntity');

var {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  convertToRaw,
  convertFromRaw,
  ContentState,
  SelectionState,
  Modifier,
  convertFromHTML,
  genKey,
  ContentBlock,
  getDefaultKeyBinding
} = Draft;

// console.log('global.window', global.window);




// console.log('jsdom loaded', jsdom);


function Expander(props) {

  let {
    expand,
  } = props.blockProps;

  return <div
  >
    <Button
      onClick={expand}
      accent
      style={{
        textTransform: "none",
      }}
    >
      Показать скрытый контент
    </Button>
  </div>;
}


const blockRenderMap = Immutable.Map({
  'image': {
    element: 'section',
  },
});

const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};


class StyleButton extends React.Component {

  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    // let className = 'RichEditor-styleButton';
    // if (this.props.active) {
    //   className += ' RichEditor-activeButton';
    // }

    var icon;

    switch (this.props.type) {
      case 'Bold':
        icon = <Bold />;
        break;

      case 'Italic':
        icon = <Italic />;
        break;

      case 'Underlined':
        icon = <Underlined />;
        break;

      default: return null;
    }

    // tooltip={this.props.label}
    // tooltipPosition="bottom-center"
    // tooltipStyles={{
    //   top: 25
    // }}

    return (
      <IconButton
        key='Bold'
        onClick={this.onToggle}
        style={{
          height: 30,
          width: 30,
          padding: 0
        }}
      >
        {icon}
      </IconButton>
    );
  }
}

var INLINE_STYLES = [
  { label: 'Жирный', type: 'Bold', style: 'BOLD' },
  { label: 'Наклонный', type: 'Italic', style: 'ITALIC' },
  { label: 'Подчеркнутый', type: 'Underlined', style: 'UNDERLINE' },
  // {label: 'Monospace', style: 'CODE'},
];

const Controls = (props) => {

  var currentStyle = props.editorState.getCurrentInlineStyle();

  var insertButton;


  return (
    <div className="RichEditor-controls">

      <IconButton
        key='Bold'
        onClick={props.insertCodeBlock}
        style={{
          height: 30,
          width: 30,
          padding: 0
        }}
      >
        <Code />
      </IconButton>

      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          type={type.type}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} rel="nofollow" target="_blank">
      {props.children}
    </a>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);


/**
 * Если передана функция onChange, 
 * при обновлении будет формироваться rawContent.
 * 
 * При вызове Send() возвращается rawContent
 */

export default class TextEditor extends React.Component {

  static contextTypes = {
  };

  static propTypes = {
    onChange: PropTypes.func,
    Send: PropTypes.func,
  }

  static defaultProps = {
    fullView: true,
  }

  constructor(props) {

    super(props);


    console.log("TextEditor constructor", props);

    let {
      setFullView,
    } = this.props;

    let editorState = this.initEditState(props.content);

    this.state = {
      editorState: editorState,
      // editorState: EditorState.createEmpty(decorator),
      liveTeXEdits: Map(),
      id: props.id,
      readonly: !props.allow_edit,
      // update: false,
      target_id: props.target_id || null,
      // fullView: props.fullView,
      inEditMode: props.inEditMode || false,
      allow_edit: props.allow_edit || false,
      clearOnSave: props.clearOnSave || false,
      images: [],
      isDirty: false,
      lastModified: null,
      errors: {},
      // show_message: "",
      sending: false,
    };

    this._blockRenderer = (block) => {
      if (block.getType() === 'atomic') {

        if (this.props.fullView !== true && this.state.inEditMode !== true) {

          return {
            component: Expander,
            props: {
              expand: setFullView,
            },
          };
        }

        return {
          component: TextBlock,
          editable: false,
          props: {
            allow_edit: this.state.inEditMode,
            _insertText: this._insertText,
            fullView: this.props.fullView === true || this.state.inEditMode === true,
            onStartEdit: (blockKey) => {
              // alert('onStartEdit');
              var { liveTeXEdits } = this.state;
              this.setState({ liveTeXEdits: liveTeXEdits.set(blockKey, true) });
            },
            onFinishEdit: (blockKey, newContentState) => {
              // alert('onFinishEdit');
              var { liveTeXEdits } = this.state;

              let editorState = EditorState.createWithContent(newContentState);

              EditorState.set(editorState, { decorator: decorator });

              this.setState({
                liveTeXEdits: liveTeXEdits.remove(blockKey),
                editorState: editorState,
              });
            },
            onRemove: (blockKey) => this._removeTeX(blockKey),
          },
        };
      }

      else if (block.getType() === 'image') {

        if (this.props.fullView !== true && this.state.inEditMode !== true) {

          return {
            component: Expander,
            props: {
              expand: setFullView,
            },
          };
        }

        return {
          component: ImageBlock,
          editable: false,
          props: {
          },
        };
      }
      return null;
    };

    this._onChange = (editorState) => {

      this.setState({
        editorState,
      });

      const {
        onChange,
      } = this.props;

      if (onChange) {


        const currentContent = editorState.getCurrentContent();

        return onChange(editorState, convertToRaw(currentContent));
      }


    };

    this._handleKeyCommand = command => {

      var { editorState } = this.state;
      var newState = RichUtils.handleKeyCommand(editorState, command);


      if (newState) {
        // newState.isDirty = true;
        this._onChange(newState);
        return true;
      }
      return false;
    };

    this._removeTeX = (blockKey) => {

      var { editorState, liveTeXEdits } = this.state;
      this.setState({
        liveTeXEdits: liveTeXEdits.remove(blockKey),
        editorState: removeTextBlock(editorState, blockKey),
      });
    };

    this._insertText = () => {
      this.setState({
        liveTeXEdits: Map(),
        editorState: insertTextBlock(this.state.editorState),
      });
    };


    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
  }


  initEditState(content) {
    var editorState;


    var state = null;

    if (content && typeof content == "string") {

      /*
      * Пытаемся распарсить JSON
      * */
      try {
        var json = JSON.parse(content);

        if (json) {
          content = json;
        }
      }
      catch (e) {

      }

      if (!content.blocks) {
        // if(typeof window != "undefined"){
        // }

        if (typeof window != "undefined") {
          var blocks = convertFromHTML(content);
          state = ContentState.createFromBlockArray(blocks);
        }

        /*
          В роутере server-side прописана функция виртуализации DOM.
          https://github.com/facebook/draft-js/issues/586#issuecomment-300347678
        */
        else if (global.serverDOMBuilder) {

          const blocks = convertFromHTML(content, global.serverDOMBuilder);
          // const blocks = global.serverDOMBuilder(content, convertFromHTML);

          state = ContentState.createFromBlockArray(blocks);
        }
      }
    }

    if (!state && content && content.blocks) {
      state = convertFromRaw(content);
    }

    if (state) {
      editorState = EditorState.createWithContent(state);
    }
    else {
      editorState = EditorState.createEmpty();
    }



    return EditorState.set(editorState, { decorator: decorator });

    // editorState = EditorState.createEmpty(); 

    // return editorState;
  }


  clearError() {
    this.setState({
      errors: {},
    });
  }

  /*
   * Пытаемся получить картинку по ссылке
   * */
  parseImageLink(block_id, text) {


    var match = text.matchAll(/((^| |\.)https?\:\/\/.+?\/.+?)( |$|\n|\t|\r)/gi);

    if (match) {

      var result;
      while (result = match.next()) {

        if (!result.value || result.done == true) {
          break;
        }

        var url = result.value[1];
        let scope = this;



        if (url != '') {

          fetch('/api/get_image_meta/?url=' + url, {
            method: "GET",
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              // console.log('parseImageLink data', data);

              if (!data) {
                return;
              }

              /*
              * Если УРЛ был получен,
              * разбиваем текущий текстовый блок
              * */
              if (data.success && data.url) {

                let { editorState } = scope.state;


                let newBlockType = 'image';

                var initialData = {
                  original_url: url,
                  url: data.url,
                }

                const selection = editorState.getSelection();
                // let block_id = selection.getAnchorKey();
                const content = editorState.getCurrentContent();
                const blockMap = content.getBlockMap();
                const block = blockMap.get(block_id);
                const blocksBefore = blockMap.toSeq().takeUntil((v) => (v === block));
                const blocksAfter = blockMap.toSeq().skipUntil((v) => (v === block)).rest();
                const newBlockKey = genKey();

                var text = "";
                var characterList = List();
                characterList.size = text.length;

                const newBlock = new ContentBlock({
                  key: newBlockKey,
                  type: newBlockType,
                  text: text,
                  characterList: characterList,
                  // characterList: block.getCharacterList().slice(0, 0),
                  // depth: 0,
                  data: Map(initialData),
                })


                const newBlockMap = blocksBefore.concat(
                  [[block_id, block], [newBlockKey, newBlock]],
                  blocksAfter
                ).toOrderedMap();




                const newContent = content.merge({
                  blockMap: newBlockMap,
                  selectionBefore: selection,
                  selectionAfter: selection.merge({
                    anchorKey: newBlockKey,
                    anchorOffset: 0,
                    focusKey: newBlockKey,
                    focusOffset: 0,
                    isBackward: false,
                  }),
                });


                var editorState = EditorState.push(editorState, newContent, 'split-block');


                scope._onChange(editorState);

              }

            }.bind(this))
            .catch(function (error) {
              console.error('Request failed', error);
            }
            );

          var images = this.state.images;

          this.setState({

          });
        }

      }
    }

    // Пытаемся найти все ссылки.
  }

  componentWillReceiveProps(nextProps) {

    var newState = {
      hash: new Date().getTime(),
    }

    if (this.state.allow_edit != nextProps.allow_edit) {
      newState.allow_edit = nextProps.allow_edit;
    }

    if (this.state.target_id != nextProps.target_id) {
      newState.target_id = nextProps.target_id;
    }

    if (this.state.id != nextProps.id) {
      newState.id = nextProps.id;
    }

    if (
      (this.props.inEditMode || nextProps.inEditMode)
      && this.props.inEditMode != nextProps.inEditMode
    ) {
      newState.inEditMode = nextProps.inEditMode;
    }

    if (
      this.state.tags != nextProps.tags
      && (
        this.state.tags && nextProps.tags
        && md5(this.state.tags) != md5(nextProps.tags)
      )
    ) {
      newState.tags = nextProps.tags;
    }



    this.setState(newState);
    // if(md5(nextProps.content) != md5())

    return true;
  }

  _toggleInlineStyle(inlineStyle) {
    this._onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  getAction() {
    return !this.state.id ? 'chat/postmessage' : 'chat/message/update';
  }

  prepareRequestData(data) {
    return data;
  }


  editMessage() {

    this.setState({
      inEditMode: true,
    });

    this._onChange(this.state.editorState);
  }


  _handlePastedText(text, html) {

    window.text = text;
    /*
     * Обновляем контент, ищем ссылки на картинки
     * */
    let { editorState } = this.state;
    let selection = editorState.getSelection();
    let currentBlockKey = selection.getAnchorKey();

    if (currentBlockKey) {
      let currentBlock = editorState.getCurrentContent().getBlockForKey(currentBlockKey);


      if (currentBlock.type == "unstyled") {

        if (!html) {

          if (!text || text == '') {
            return;
          }

          // if(!(/^https?:\/\/.+$/u.test(text))){
          //   return;
          // }
          /*
          * http://modxclub.local/ sdfdsf
          *
          * http://modxclub.local/
          * sdfdsf
          * */

          if (!(new RegExp("^https?\:\/\/[^ ]+$", "uim").test(text.replace(/[\n\r]/, ' ')))) {
            return;
          }

          const { editorState } = this.state;
          let selection = editorState.getSelection();
          const contentState = editorState.getCurrentContent();

          let length = text.length;
          let startSelection = selection.getEndOffset();
          let endSelection = startSelection + length;

          if (selection.isCollapsed()) {
            var cs = Modifier.insertText(
              editorState.getCurrentContent(),
              selection,
              text
            );

            var newEditorState = EditorState.push(
              editorState,
              cs,
              'insert-text'
            );


            const contentStateWithEntity = newEditorState.getCurrentContent().createEntity(
              'LINK',
              'MUTABLE',
              { url: text }
            );
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();


            var newEditorState = EditorState.set(newEditorState, { currentContent: contentStateWithEntity });

            // var linked = Modifier.applyEntity(newEditorState.getCurrentContent(), newEditorState.getSelection(), entityKey);
            var linked = Modifier.applyEntity(newEditorState.getCurrentContent(), selection.merge({
              anchorOffset: startSelection,
              focusOffset: endSelection,
              // anchorOffset: selection.getEndOffset(),
              // focusOffset: selection.getEndOffset()
            }), entityKey);

            var newEditorState = EditorState.push(newEditorState, linked, 'apply-entity');

            let collapsed = selection.merge({
              // anchorOffset: 0,
              // focusOffset: 22,
              anchorOffset: newEditorState.getSelection().getEndOffset(),
              focusOffset: newEditorState.getSelection().getEndOffset(),
            });
            var newEditorState = EditorState.forceSelection(newEditorState, collapsed);


            var cs = Modifier.insertText(
              newEditorState.getCurrentContent(),
              newEditorState.getSelection(),
              " "
            );

            // console.log('cs', cs);

            var newEditorState = EditorState.push(
              newEditorState,
              cs,
              'insert-text'
            );


            this.setState({
              editorState: newEditorState,
            }, () => {
              // setTimeout(() => this.refs.editor.focus(), 0);
            });


            // this.setState({
            //   editorState: newEditorState,
            // });

            this.parseImageLink(currentBlockKey, text);
            return 'handled';

          }

        }
      }
    }
  }


  handleDroppedFiles = (selection, files) => {
    console.log('handleDroppedFiles', selection, files);
  }

  handleDrop = (selection, files) => {
    console.log('handleDrop', selection, files);
  }

  componentWillUpdate(nextProps, nextState) {

    // console.log('componentWillUpdate', nextProps, this.props);
    // console.log('componentWillUpdate', nextState, this.state);

    /*
     * Скрываем/раскрываем допблоки контента
     * */
    if (
      nextProps.fullView != this.props.fullView
      || nextState.inEditMode != this.state.inEditMode
    ) {
      // console.log('componentDidUpdate 3');
      // this.setState({
      // });

      this.setState((prevState) => {

        var newState = prevState;

        newState.editorState = prevState.editorState;

        var newEditorState = EditorState.forceSelection(newState.editorState, newState.editorState.getSelection());

        newState.editorState = newEditorState;

        return newState;
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {

  }

  getTags() {
    return null;
  }

  keyBindingFn(e) {

    // console.log('keyBindingFn', e);
    // console.log('keyBindingFn ctrlKey', e.ctrlKey);
    // console.log('keyBindingFn keyCode', e.keyCode);

    if (e.ctrlKey && e.keyCode == 13) {
      this.Send(e);
      return;
    }

    // if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    //   return 'myeditor-save';
    // }
    return getDefaultKeyBinding(e);
  }


  Send(event) {

    const {
      Send,
    } = this.props;

    const {
      editorState,
    } = this.state;

    const currentContent = editorState && editorState.getCurrentContent();


    return Send && Send(event, currentContent && convertToRaw(currentContent) || null) || false;

  }

  /**
   * While editing TeX, set the Draft editor to read-only. This allows us to
   * have a textarea within the DOM.
   */
  render() {

    var sendButton, editButton;

    if (this.state.allow_edit) {
      if (this.state.inEditMode) {
        sendButton = <IconButton
          onClick={event => this.Send(event)}>
          {this.state.sending !== true
            ?
            <Send
              color={this.state.isDirty === true ? 'red' : '#8080FF'}
            />
            :
            <WaitIcon
              color="grey"
            />
          }

        </IconButton>;
      }
      else {
        editButton = <IconButton
          onClick={this.editMessage.bind(this)}>
          <Create />
        </IconButton>;
      }
    }

    let { editorState } = this.state;


    var controls;

    if (this.state.allow_edit && this.state.inEditMode) {
      controls = <Controls
        editorState={editorState}
        onToggle={this.toggleInlineStyle}
        insertCodeBlock={this._insertText}
      />;
    }





    return (


      <div className={"CommentEditorWrapper " + this.props.className}>

        {controls}




        <div className={"Editor-container" + (this.state.inEditMode && this.state.allow_edit ? ' edit' : '')} style={{ height: '100%', boxSizing: 'border-box' }}>
          <div className="Editor-root" style={{ width: "calc(100% - 48px)", boxSizing: 'border-box' }}>
            <div className="Editor-editor" style={{
              alignItems: 'center',
              minHeight: '30px',
              color: 'rgba(0, 0, 0, 0.87)',
              fontSize: '15px',
              fontWeight: '500',
              boxSizing: 'border-box'
            }}>
              <Editor
                editorState={editorState}
                blockRendererFn={this._blockRenderer}
                blockRenderMap={extendedBlockRenderMap}
                handleKeyCommand={this._handleKeyCommand}
                handlePastedText={this._handlePastedText.bind(this)}
                handleDroppedFiles={this.handleDroppedFiles}
                handleDrop={this.handleDrop}
                onChange={this._onChange}
                onTab={this.onTab}
                customStyleMap={styleMap}
                placeholder=""
                spellCheck={true}
                readOnly={!this.state.inEditMode || this.state.readonly || this.state.liveTeXEdits.count()}
                keyBindingFn={e => this.keyBindingFn(e)}
              />

            </div>
          </div>
          <div className="send-button__wrapper">
            {sendButton}{editButton}
          </div>
        </div>

        {this.getTags()}

      </div>

    );
  }
}

