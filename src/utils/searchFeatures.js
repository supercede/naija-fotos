/**
 *
 * @export
 * @class SearchFeatures
 */
export default class SearchFeatures {
  /**
   *Creates an instance of SearchFeatures.
   * @param {*} query - Mongoose query
   * @param {string} queryStr - request query
   * @memberof SearchFeatures
   */
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  /**
   * @description filter results
   *
   * @returns {SearchFeatures}
   * @memberof SearchFeatures
   */
  filter() {
    const queryObj = { ...this.queryStr };
    const excludedWords = ['limit', 'fields', 'sort', 'page', 'tag', 'searchField'];

    excludedWords.forEach(word => delete queryObj[word]);

    const queryStr = JSON.stringify(queryObj);

    const newStr = queryStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      match => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(newStr));
    return this;
  }

  /**
   * @description sort results
   *
   * @returns {SearchFeatures}
   * @memberof SearchFeatures
   */
  sort() {
    if (this.queryStr.sort) {
      // Mongoose sort parameters are separated by a space

      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // minus sign signifies descending order
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  /**
   * @description limit fields to return
   *
   * @returns {SearchFeatures}
   * @memberof SearchFeatures
   */
  fieldLimit() {
    if (this.queryStr.fields) {
      // Required fields are separated with a comma
      // Adding a minus to a required field wll exclude it from returned data
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v -id');
    }

    return this;
  }

  /**
   * @description paginate results
   *
   * @returns {SearchFeatures}
   * @memberof SearchFeatures
   */
  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
