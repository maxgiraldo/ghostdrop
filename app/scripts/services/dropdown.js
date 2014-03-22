app.factory('Drop', function($resource){
  return $resource('dropdown/:dropdownId', {
    dropdownId: '@_id'
  }, {
    update: {
      method: 'PUT'
    }
  });
});