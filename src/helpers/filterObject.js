export default function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key === 'email') {
        newObj['local.email'] = obj[key];
      } else {
        newObj[key] = obj[key];
      }
    }
  });
  return newObj;
}
