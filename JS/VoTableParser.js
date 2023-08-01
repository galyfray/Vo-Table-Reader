const tokenizers = require("./tokenizers");
const {TokenStream} = require("./TokenStream");
const CharStream = require("./CharStream");

class UnexpectedTokenError extends Error {}

class VoTableParser {

    constructor(VoTable) {
        this._vo_table = VoTable;
        this._char_stream = new CharStream(VoTable);
        this._token_stream = new TokenStream(this._char_stream,
            this._isWhitespace,
            new tokenizers.StringTokenizer("'"),
            new tokenizers.StringTokenizer('"'),
            new tokenizers.NumberTokenizer(),
            new tokenizers.QMarkTokenizer(),
            new tokenizers.TagClosingTokenizer(),
            new tokenizers.TagOpeningTokenizer(),
            new tokenizers.IdentifierTokenizer(),
            new tokenizers.OperatorTokenizer(),
            new tokenizers.ParenthesisTokenizer(),
            new tokenizers.WhitespaceTokenizer()
        );
        this._internal = {};
        this._parse();
    }

    //==#===#==// Parsing functions //==#===#==//

    /**
     * This function aims to parse the prologue of the xml doccument if present and the mandatory VOTABLE tag.
     * This function will raise a SyntaxError if the VOTABLE tag is not found, and a warning if the VOTable's version is not known.
     */
    _parse_init() {
        if (this._token_stream.next().type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
            throw new SyntaxError("VOTABLE tag not found");
        }
        let prologue = this._token_stream.peek().type === tokenizers.QMarkTokenizer.TYPE;
        let data = this._parse_payload(prologue);
        if (prologue) {
            this._internal.prologue = data;
            if (this._token_stream.peek().type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
                throw new SyntaxError("VOTABLE tag not found");
            }
            this._token_stream.next();
            this._internal.VoTable = this._parse_payload();
        } else {
            this._internal.VoTable = data;
        }

        if (this._internal.VoTable.name !== "VOTABLE") {
            throw new SyntaxError("VOTABLE tag not found");
        }
    }

    /**
     * Helper function that parse the payload of a tag.
     * This function assumes that the tag opening as already been consumed
     * @param {boolean} is_prologue true if the tag is the prologue of the xml document.
     */
    _parse_payload(is_prologue = false) {
        let data = {};
        if (is_prologue) {
            this._token_stream.next();
            if (this._token_stream.peek().value !== "xml") {
                this._throw(this._token_stream.next(), "xml");
            }
        }
        data.name = this._token_stream.next();
        if (data.name.type !== tokenizers.IdentifierTokenizer.TYPE) {
            this._throw(data.name, "a valid xml identifier");
        }
        data.name = data.name.value;
        data.attributes = {};
        let current = data.attributes;
        while (
            this._token_stream.peek().type !== tokenizers.TagClosingTokenizer.TYPE.TAG_CLOSING &&
            this._token_stream.peek().type !== tokenizers.TagClosingTokenizer.TYPE.TAG_SELF_CLOSING &&
            (!is_prologue || this._token_stream.peek().type !== tokenizers.QMarkTokenizer.TYPE)
        ) {
            current = data.attributes;
            let key = this._token_stream.next();
            if (key.type !== tokenizers.IdentifierTokenizer.TYPE) {
                this._throw(key, "a valid payload identifier");
            }
            if (this._char_stream.peek() === ":") {
                this._char_stream.next();
                if (data.attributes[key.value] === undefined) {
                    data.attributes[key.value] = {};
                    current = data.attributes[key.value];
                    key = this._token_stream.next();
                    if (key.type !== tokenizers.IdentifierTokenizer.TYPE) {
                        this._throw(key, "a valid payload identifier");
                    }
                }
            }
            if (this._char_stream.peek() !== "=") {
                this._throw(this._token_stream.next(), "=");
            }
            this._char_stream.next();
            let value = this._token_stream.next();
            if (value.type !== tokenizers.StringTokenizer.TYPE) {
                this._throw(value, "All attributes must be quoted values");
            }
            current[key.value] = value.value;
        }

        if (is_prologue) {
            this._token_stream.next();
        }
        data.self_closed = this._token_stream.next().type === tokenizers.TagClosingTokenizer.TYPE.TAG_SELF_CLOSING;
        return data;
    }

    /**
     * Helper function dedicated to parse a description tag.
     * This helper assumes that the opening tag has been already consumed and the current token is a DESCRIPTION identifier.
     * returns an object representing a description tag and all of it's componant.
     */
    _parse_description() {
        let data = this._parse_payload();
        data.content = "";
        while (this._token_stream.peek(false).type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING) {
            data.content += this._token_stream.next(false).value;
        }
        this._consume_closing("DESCRIPTION");
        return data;
    }

    /**
     * Helper function dedicated to parse a field tag.
     * This helper assumes that the opening tag has been already consumed and the current token is a FIELD identifier.
     * returns an object representing a field tag and all of it's componant.
     */
    _parse_field() {
        let field = this._parse_payload();

        // Note that a Field container can be empty. This is absurde but valid.
        if (this._consume_closing("FIELD", false)) {
            return field;
        }
        this._consume_opening();

        if (this._token_stream.peek().value === "DESCRIPTION") {
            field.description = this._parse_description();

            if (this._consume_closing("FIELD", false)) {
                return field;
            }

            this._consume_opening();
        }

        /**
         * VALUES
         */

        /**
         * LINK
         */

        this._consume_closing("FIELD");
        return field;
    }

    /**
     * Helper function dedicated to parse a table data tag.
     * This helper assumes that the opening tag has been already consumed and the current token is a TABLEDATA identifier.
     * returns an object representing a table data tag and all of it's componant.
     */
    _parse_table_data() {
        let table = this._parse_payload();

        table.rows = [];

        // Note that a Tabledata container can be empty. This is for once logic.
        if (this._consume_closing("TABLEDATA", false)) {
            return table;
        }
        this._consume_opening();

        let row;
        let data;
        while (this._token_stream.peek().value === "TR") {
            this._token_stream.next(); // TR are not expected to have a payload
            this._token_stream.next();

            row = [];
            this._consume_opening();

            while (this._token_stream.peek().value === "TD") {
                this._token_stream.next(); // TD are not expected to have a payload
                this._token_stream.next();

                data = "";
                while (
                    this._token_stream.peek(false).type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING
                ) {

                    data += this._token_stream.next(false).value;
                }

                row.push(data);
                this._consume_closing("TD");
            }
            table.rows.push(row);
            this._consume_closing("TR");
        }

        this._consume_closing("TABLEDATA");
        return table;
    }

    /**
     * Helper function dedicated to parse a data tag.
     * This helper assumes that the opening tag has been already consumed and the current token is a DATA identifier.
     * returns an object representing a data tag and all of it's componant.
     */
    _parse_data() {
        let data = this._parse_payload();
        this._consume_opening();

        if (this._token_stream.peek().value === "TABLEDATA") {
            data.data = this._parse_table_data();
        }

        /**
         * BINARY
         */

        /**
         * BINARY2
         */

        /**
         * FITS
         */

        this._consume_closing("DATA");
        return data;
    }

    /**
     * Helper function dedicated to parse a table tag.
     * This helper assumes that the opening tag has been already consumed and the current token is a TABLE identifier.
     * returns an object representing a table tag and all of it's componant.
     */
    _parse_table() {
        let table = this._parse_payload();

        // Note that a Table container can be empty. This is absurde but valid.
        if (this._consume_closing("TABLE", false)) {
            return table;
        }
        this._consume_opening();

        if (this._token_stream.peek().value === "DESCRIPTION") {
            table.description = this._parse_description();

            if (this._consume_closing("TABLE", false)) {
                return table;
            }

            this._consume_opening();
        }

        table.fields = [];
        table.params = [];
        table.groups = [];

        while (
            this._token_stream.peek().value === "FIELD" /*||
            this._token_stream.peek().value === "PARAM" ||
            this._token_stream.peek().value === "GROUP" */
        ) {
            if (this._token_stream.peek().value === "FIELD") {
                table.fields.push(this._parse_field());
            }

            /**
             * PARAM
             * GROUP
             */

            if (this._consume_closing("TABLE", false)) {
                return table;
            }

            this._consume_opening();
        }

        /**
         * LINK
         */

        if (this._token_stream.peek().value === "DATA") {
            table.data = this._parse_data();

            if (this._consume_closing("TABLE", false)) {
                return table;
            }

            this._consume_opening();
        }

        /**
         * INFO
         */
        this._consume_closing("TABLE", false); // TODO : remove the false to raise an error.
        return table;
    }

    /**
     * Helper function dedicated to parse a ressource tag.
     * This helper assumes that the opening tag has been already consumed and the current token is a RESSOURCE identifier.
     * returns an object representing a ressource tag and all of it's componant.
     */
    _parse_resource() {
        let resource = this._parse_payload();

        // Note that a Ressource container can be empty. This is absurde but valid.
        if (this._consume_closing("RESOURCE", false)) {
            return resource;
        }
        this._consume_opening();

        if (this._token_stream.peek().value === "DESCRIPTION") {
            resource.description = this._parse_description();

            if (this._consume_closing("RESOURCE", false)) {
                return resource;
            }

            this._consume_opening();
        }

        /**
         * INFO
         */

        /**
         * COOSYS
         * TIMESYS
         * PARAM
         * GROUP
         */

        /**
         * LINK
         */
        if (this._token_stream.peek().value === "TABLE") {
            resource.table = this._parse_table();
            if (this._consume_closing("RESOURCE", false)) {
                return resource;
            }

            this._consume_opening();
        }

        // FIXME : recusive behavior inside a parser should be avoided.
        if (this._token_stream.peek().value === "RESOURCE") {
            resource.resource = this._parse_resource();
        }

        /**
         * INFO
         */

        this._consume_closing("RESOURCE", false); // TODO : remove the false to raise an error.
        return resource;
    }

    _parse() {
        this._parse_init();
        this._consume_opening();
        if (this._token_stream.peek().value === "DESCRIPTION") {
            this._internal.VoTable.description = this._parse_description();
            this._consume_opening();
        }

        /**
         * COOSYS
         * TIMESYS
         * INFO
         * PARAM
         * GROUP
         */

        if (this._token_stream.peek().value !== "RESOURCE") {
            this._throw(this._token_stream.next(), "a RESOURCE tag");
        }

        this._internal.VoTable.resources = [];
        while (this._token_stream.peek().value === "RESOURCE") {
            this._internal.VoTable.resources.push(this._parse_resource());
            if (this._token_stream.peek().type === tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING) {
                break;
            } else {
                this._consume_opening();
            }
        }

        /**
         * INFO
         */

        this._consume_closing("VOTABLE");
    }

    //==#===#==// Generic helpers //==#===#==//

    /**
     * Helper function that simply check if the next token is a simple tag opening and consume it if so.
     * If the token is anything esle this helper will throw an error.
     */
    _consume_opening() {
        if (this._token_stream.peek().type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
            this._throw(this._token_stream.next(), "an opening tag");
        }
        this._token_stream.next();
    }

    /**
     * Helper function that handles the consumption of ending tokens
     * @param {string} expected The expected identifier to close. if null any identifier will be accepted
     * @param {boolean} raising Wheter or not this method should rase an error if a closig tag isn't found.
     * @returns true if the ending got correctly consumed, false otherwise.
     */
    _consume_closing(expected, raising = true) {
        if (this._token_stream.peek().type === tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING) {
            this._token_stream.next();
            if (this._token_stream.peek().value !== expected && expected !== null) {
                this._throw(this._token_stream.next(), "a closing " + expected + " tag");
            }
            this._token_stream.next();
            if (this._token_stream.peek().type !== tokenizers.TagClosingTokenizer.TYPE.TAG_CLOSING) {
                this._throw(this._token_stream.next(), "a closing tag (>)");
            }
            this._token_stream.next();
            return true;
        } else if (raising) {
            this._throw(this._token_stream.next(), "a closing tag");
        }
        return false;
    }

    /**
     * Helper function that build an error message an then throw an {@link UnexpectedTokenError}
     * @param {object} token the unexpected token, can be null.
     * @param {string} expected optional string that contains the expected tokens if known.
     */
    _throw(token, expected = null) {
        let message;
        if (token) {
            let column = this._char_stream.getColumn() - token.value.length;

            message = `Unexpected token ${token.value} at` +
                ` line ${this._char_stream.getLine()} column ${this._char_stream.getColumn()}`;

            if (expected) {
                message += `, expected ${expected}`;
            }

            message += "\n" + this._vo_table.split("\n")[this._char_stream.getLine() - 1] + "\n";

            for (let i = 0;i < column - 1;i++) {
                message += " ";
            }
            for (let i = 0;i < token.value.length;i++) {
                message += "^";
            }

            throw new UnexpectedTokenError(message);
        } else {
            message = `Unexpected end of query at` +
                `line ${this._char_stream.getLine()} column ${this._char_stream.getColumn()}`;

            if (expected) {
                message += `, expected ${expected}`;
            }

            throw new UnexpectedTokenError(message);
        }
    }

    _isWhitespace(char) {
        return char === " " || char === "\n" || char === "\t" || char === "\r";
    }
}

module.exports = {VoTableParser, UnexpectedTokenError};