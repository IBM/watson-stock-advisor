import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { faTable } from '@fortawesome/free-solid-svg-icons';

import Panel from './Panel';

storiesOf('Panel', module)
    .add('panel with simple content', () => (
        <Panel
            title="Your portfolio"
            icon={faTable}
            footer="Updated 26/08/2019, 08:19:47"
        >
            Here will be some content
        </Panel>
    ));
