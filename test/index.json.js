define([
    'intern!bdd',
    'intern/chai!expect',
    'src/index.json'
], function (bdd, expect, indexJson) {

    with (bdd) {
        describe('indexJson', function () {

            describe('#filterPrefix', function () {

                it('should be set to $', function () {
                    expect(indexJson.filterPrefix).to.equal('$');
                });
            });
        });
    }
});
