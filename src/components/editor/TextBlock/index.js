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

import React from 'react';

import PropTypes from "prop-types";

import Chip from 'material-ui/Chip';

import withStyles from 'material-ui/styles/withStyles';

import CodeOutputBlock from "./CodeBlock";

const styles = (theme) => {

  // console.log("theme", theme);

  if (!theme) {
    return {

    }
  }

  return {

    chip: {
      margin: theme.spacing.unit,
      height: 25,
      cursor: 'pointer',

      '&.active': {
        backgroundColor: theme.palette.primary[500],
        color: "white",

        '& .label': {
          color: theme.palette.secondary.contrastDefaultColor,
        },
      },
    },
    svgIcon: {
    },
    row: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
  }
};


export class TextBlock extends React.Component {


  static propTypes = {
    lang: PropTypes.string.isRequired,
  }

  static defaultProps = {
    lang: "php",
  }


  constructor(props) {
    super(props);

    // console.log('TextBlock construct', props);

    this.state = {
      editMode: false,
      lang: this._getLang() || props.lang,
      allow_edit: props.blockProps.allow_edit,
    };

    // console.log('TextBlock construct state', props, this.state);

    this._onClick = () => {

      // alert(!this.state.allow_edit);
      // alert(this.state.editMode);

      if (!this.state.allow_edit) {
        return;
      }

      if (this.state.editMode) {
        return;
      }

      this.setState({
        editMode: true,
        textValue: this._getValue(),
      }, () => {
        this._startEdit();
      });
    };

    this._onValueChange = evt => {
      var value = evt.target.value;
      this.setState({
        textValue: value,
      });
    };


    /*
    *   Сохранение.
    *   Если контента нет, то удаляем этот блок
    * */
    this._save = () => {

      var value = this.state.textValue;

      if (value !== '') {
        var entityKey = this.props.block.getEntityAt(0);
        var newContentState = this.props.contentState.mergeEntityData(entityKey, {
          content: this.state.textValue,
          lang: this.state.lang,
        });
        this.setState({
          invalidTeX: false,
          editMode: false,
          textValue: null,
        }, this._finishEdit.bind(this, newContentState));
      }
      else {
        this._remove();
      }
    };

    this._remove = () => {

      // console.log('this.props.blockProps.onRemove', this.props.block.getKey());

      this.props.blockProps.onRemove(this.props.block.getKey());
    };
    this._startEdit = () => {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
    };
    this._finishEdit = (newContentState) => {
      this.props.blockProps.onFinishEdit(this.props.block.getKey(), newContentState);
    };
  }


  _getData() {
    var data = this.props.contentState
      .getEntity(this.props.block.getEntityAt(0))
      .getData();

    return data;
  }

  _getValue() {
    var content = this._getData()['content'];

    // if(
    //   this.state.editMode &&
    //   content == 'Кликните чтобы начать редактирование'
    // ){
    //   content = '';
    // }

    return content;
  }

  _getLang() {
    var lang = this._getData()['lang'];

    // if(
    //   this.state.editMode &&
    //   content == 'Кликните чтобы начать редактирование'
    // ){
    //   content = '';
    // }

    return lang;
  }

  // _onTab(event) {
  //   this._onChange(RichUtils.onTab(event, this.state.editorState, 6));
  // }

  componentWillReceiveProps(nextProps) {

    // console.log("TextBlock componentWillReceiveProps", nextProps);

    if (nextProps.blockProps.allow_edit != this.state.allow_edit) {
      this.setState({
        allow_edit: nextProps.blockProps.allow_edit,
      });
    }

    return true;
  }


  render() {

    const {
      classes,
    } = this.props;

    var texContent = null;
    if (this.state.editMode) {
      // if (this.state.invalidTeX) {
      //   texContent = '';
      // } else {
      //   texContent = this.state.textValue;
      // }

      texContent = this.state.textValue;

      // if(texContent == 'Кликните чтобы начать редактирование'){
      //   texContent = '';
      // }

    }
    else {

      if (
        this.props.blockProps.fullView === false
      ) {
        return null;
      }

      texContent = this._getValue();
    }

    var className = 'Editor-text';
    if (this.state.editMode) {
      className += ' Editor-activeText';
    }

    var editPanel = null;
    // if (this.state.allow_edit && this.state.editMode) {
    if (this.state.editMode) {
      var buttonClass = 'Editor-saveButton';
      // if (this.state.invalidTeX) {
      //   buttonClass += ' Editor-invalidButton';
      // }

      let height = "40px";

      let langs = [{
        value: "php",
        label: "PHP",
      }, {
        value: "javascript",
        label: "Javascript",
      }, {
        value: "jsx",
        label: "JSX",
      }, {
        value: "sql",
        label: "SQL",
      }, {
        value: "css",
        label: "CSS",
      }, {
        value: "html",
        label: "HTML",
      }, {
        value: "smarty",
        label: "Smarty",
      }, {
        value: "solidity",
        label: "Solidity",
      }, {
        value: "bash",
        label: "Bash",
      }];

      var chips = [];

      langs.map((item) => {
        var className = [classes.chip, "test-chip"];

        if (item.value == this.state.lang) {
          className.push("active");
        }

        chips.push(<Chip
          key={item.value}
          label={item.label}
          className={className.join(" ")}
          // labelClassName="label"
          onClick={() => {
            this.setState({
              lang: item.value,
            });
          }}
        />);
      });

      editPanel =
        <div className="Editor-panel">

          <div className={classes.row}>
            {chips}
          </div>

          <textarea
            className="Editor-textValue"
            onChange={this._onValueChange}
            ref="textarea"
            value={this.state.textValue}
          />
          <div className="Editor-buttons">
            <button
              className={buttonClass}
              disabled={this.state.invalidTeX}
              onClick={this._save}
            >
              {'Сохранить'}
            </button>
            <button className="Editor-removeButton" onClick={this._remove}>
              Удалить
            </button>
          </div>
        </div>;
    }

    return (
      <div className={className}>

        <CodeOutputBlock
          content={texContent}
          lang={this.state.lang}
          onClick={this._onClick}
        />
        {editPanel}
      </div>
    );
  }
}




export default withStyles(styles)(TextBlock);