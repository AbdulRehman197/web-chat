import { all, call, select, take, takeEvery, put } from "redux-saga/effects";

import { makeChannel } from "../_helpers";

import { receivedForm, 
    loadedFormNodes,
    receivedFormTemplate,
    SUBSCRIBE_TO_FORMS,
    SUBMIT_FORM } from '../../ducks/forms';


    // console.log('getting disco info!')
    // client.getDiscoInfo('pubsub.localhost', '').then(response => {
    //   console.log(response.discoInfo.identities);
    //   // TODO confirm that "urn:xmpp:fdp:0" is one of the identities type...

    // });
  

function* fetchFormNodes(client) {

    const allNodes = yield call([client, client.getDiscoItems], 'pubsub.localhost', '');

    let templateNodes = [];
    let submissionNodes = [];

    allNodes.discoItems.items.forEach((node) => {
        if(node.node.startsWith('fdp/template')) {
            templateNodes.push(node.node);
            return;
        }
        if(node.node.startsWith('fdp/submitted')) {
            submissionNodes.push(node.node);
            return;
        }
    });

    yield put(loadedFormNodes(templateNodes, submissionNodes));

}

function* subscribeToFormNodes(client) {

    yield take(SUBSCRIBE_TO_FORMS);

    yield fetchFormNodes(client);

    const submissionNodes = yield select(state => state.forms.nodes.submissionNodes);
    // TODO check for existing subscription first?
    // TODO change to yield all
    submissionNodes.forEach((node) => {
        client.subscribeToNode('pubsub.localhost', node);
    });

    // TODO maybe do this on the fly
    yield call(loadFormTemplates, client);

}

function* loadFormTemplates(client) {
    const templateNodes = yield select(state => state.forms.nodes.templateNodes);
    yield all(templateNodes.map(node => call(loadTemplate, client, node)));
}

function* loadTemplate(client, node) {
    let response = yield call([client, client.getItems], 'pubsub.localhost', node, { max: 1 });
    yield put(receivedFormTemplate(response.pubsub.retrieve.item.form));
}

function* watchForForms(client) {
    
    const channel = makeChannel(client, {
        'dataform': (emit, msg) => {
            emit(msg);
        },
        "pubsub:published": (emit, msg) => {
            // console.log('published...', msg)
        }
    });

    yield takeEvery(channel, function* eachForm(msg) {

        yield put(
            receivedForm({
                ...msg,
                time: (msg.delay && msg.delay.stamp) || new Date()
            })
        );

    });
}

function* publishForm(client) {

    yield takeEvery(SUBMIT_FORM, function* submitForm(action) {

        let formData = {
            type: 'submit',
            fields: action.payload.form
        };

        const response = yield call([client, client.publish], 
            'pubsub.localhost', 
            action.payload.node, 
            { 
                form: formData
            }
        );

        // Message the MUC
        // TODO remove hardcoding
        // TODO build up the 
        yield call([client, client.sendMessage], {
            to: action.payload.jid,
            type: 'groupchat',
            body: "RAWHARDCODEDFORMMESSAGEHERE",
            form: formData
        });

    });

}

export default function*(client) {
  yield [watchForForms(client), subscribeToFormNodes(client), publishForm(client)];
}