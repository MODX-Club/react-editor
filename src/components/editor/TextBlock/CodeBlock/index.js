
import React from 'react';

import PropTypes from "prop-types";


import 'prismjs/themes/prism.css';

import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-php.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-smarty.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-bash.js';

// Custom module
import 'prismjs/solidity';

export default class CodeOutputBlock extends React.Component {

  static propTypes = {
    lang: PropTypes.string.isRequired,
  }

  componentDidMount() {
    if (!this.props.content) {
      this.props.onClick();
    }
  }

  render() {

    var output;

    let {
      lang,
      content,
      onClick,
    } = this.props;


    const language = Prism.languages[lang];

    if (typeof language == "undefined") {
      console.error("Unsupported language '" + lang + "'");
      lang = this.defaultLang;
    }


    if (content) {
      output = Prism.highlight(content, language, lang);
    }

    return <div
      className="text-content"
      dangerouslySetInnerHTML={{ __html: output }}
      onClick={onClick}
    />;
  }
}

