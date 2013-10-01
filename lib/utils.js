exports.unquote = function(value) {
  var quote = value[0]

  if (quote == "'" || quote == '"')
    return value.slice(1, -1).replace(quote + quote, quote)
  else
    return value
}

exports.TRUES = [true, 1, "1", "t", "T", "true", "TRUE", "on", "ON"]
exports.FALSES = [false, 0, "0", "f", "F", "false", "FALSE", "off", "OFF"]
exports.NUMERIC = /^-?\d*(\.\d*)?(e\d+)?$/
