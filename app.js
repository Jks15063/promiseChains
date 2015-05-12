var Q = require('q');

function foo() {
    return waitForPromiseA()
    .then(function(x) {
        console.log('--> inner then 1', x);
        return waitForPromiseB();
    })
    .then(function(x) {
        console.log('--> inner then 2', x);
        return waitForPromiseB();
    })
    .fail(function(err) {
        console.log('---> Inner Err:', err);
        return Q(err);
    })
    .finally(function() {
        console.log('--> finally');
        return waitForPromiseA();
    });
}

function waitForPromiseA() {
    var defer = Q.defer();
    var time = Math.floor(Math.random() * 1000);
    console.log('A time:', time);
    setTimeout(function() {
        return defer.resolve('A');
    }, time);
    return defer.promise;
}

function waitForPromiseB() {
    var defer = Q.defer();
    var time = Math.floor(Math.random() * 1000);
    console.log('B time:', time);
    setTimeout(function() {
        if(time % 10 === 0) {
            return defer.reject('oops B');
        } else {
            return defer.resolve('B');
        }
    }, time);
    return defer.promise;
}

var bar = foo();

var chain1 = bar
.then(function(x) {
    console.log('branch 1, outer then 1', x);
    return waitForPromiseA();
})
.then(function(x) {
    console.log('branch 1, outer then 2', x);
    return waitForPromiseA();
})
.fail(function(err) {
    console.log('branch 1 Err:', err);
    return Q.reject(err);
});

var chain2 = bar
.then(function(x) {
    console.log('branch 2, outer then 1', x);
    return waitForPromiseB();
})
.then(function(x) {
    console.log('branch 2, outer then 2', x);
    return waitForPromiseB();
})
.fail(function(err) {
    console.log('branch 2 Err:', err);
    return Q.reject(err);
});

Q.all([chain1, chain2])
.then(function(arr) {
    console.log('All Done', arr);
})
.fail(function(err) {
    console.log('final err:', err);
})
.done();
