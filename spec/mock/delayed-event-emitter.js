"use strict";

var events;

events = require("events");

/**
 * Exists primarily because of delayEmit.
 */
class DelayedEventEmitter extends events.EventEmitter {
    /**
     */
    constructor() {
        super();
        this.delayedEmitList = [];
    }


    /**
     * Does what events.EventEmitter.on does except it also
     * may trigger a "delayed emit".
     *
     * @param {string} eventName
     * @param {Function} listener
     * @return {DelayedEventEmitter}
     */
    on(eventName, listener) {
        super.on(eventName, listener);

        this.delayedEmitList.forEach((delayedEmit) => {
            var matchesRequired;

            matchesRequired = true;
            Object.keys(delayedEmit.requiredListeners).forEach((e) => {
                var count;

                count = delayedEmit.requiredListeners[e];

                if (this.listenerCount(e) < count) {
                    matchesRequired = false;
                }
            });

            if (matchesRequired) {
                this.emit.apply(this, delayedEmit.args);
            }
        });

        return this;
    }


    /**
     * Sets up a delayed emit. It will not emit the event
     * until the required listeners are already attached.
     * In our code we used to have things like.
     *
     *      requestMock.get = () => {
     *          setTimeout(() => {
     *              requestMock.emit("response", responseMock);
     *              responseMock.emit("finish");
     *          });
     *
     *          return requestMock;
     *      };
     *
     * We required the setTimeout so that it waited until it was
     * done running that context where all listeners were attached
     * before emitting the events.
     *
     * The problem with this was that if any error happened, jasmine
     * was unable to catch it because it was not in an async context.
     * This means that the test would just stop working without running
     * the rest of them or failing the test that was running.
     *
     * requiredListeners is a key value object where the key is the name
     * of an event and the value is the number of listeners you require
     * before the event is emitted. For example, say I needed a "data"
     * listener attached before emitting my "data" event.
     *
     *      this.delayEmit({
     *          data: 1
     *      }, "data", myData);
     *
     * @param {Object} requiredListeners
     * @param {string} eventName
     */
    delayEmit(requiredListeners) {
        this.delayedEmitList.push({
            requiredListeners,
            args: Array.prototype.slice.call(arguments, 1)
        });
    }

    /**
     * Because this is how we always use it except we
     * do this in every test.
     *
     * If in the future you would like to test what is
     * passed to it you can still use jasmine.spyOn.
     *
     * @return {ResponseMock}
     */
    pipe() {
        return this;
    }
}

module.exports = DelayedEventEmitter;
