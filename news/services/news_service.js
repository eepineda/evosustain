
app.service('NewsService', NewsService);

function NewsService($http) {
    var self = this;

    var rootEndpoint = 'https://newsapi.org';
    var apiKey = '177a5cf6c628455290391b4fb11d36a9';

    this.get = function(url, config) {
        console.log('get ' + rootEndpoint + url);
            return $http.get(rootEndpoint + url, config).then(function (resp) {
                console.log('returning ' + JSON.stringify(resp.data).substr(0, 300));
                return resp.data;
        });
    };

    self.getAllTopHeadlines = function(queryParams) {
        queryParams['apiKey'] = apiKey;
        return this.get('/v2/top-headlines', {params: queryParams}).then(function (res) {
            return res;
        });
    };
};
