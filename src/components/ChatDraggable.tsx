import React, { useState, useContext } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { Card, Typography, Modal, Form, InputNumber, Button } from 'antd';
import {
  CloseOutlined,
  TransactionOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

import { PeerContext } from '../context';
import { useWebRTC } from '../hooks';
import { Video } from './Video';

type ChatDraggableProps = {
  id: string;
  initiator: boolean;
  close: Function;
  initialSignal?: string;
  sendTransaction: Function;
};

const StyledCard = styled(Card)`
  position: relative;
  width: 300px;
  background-color: white;
`;

const MessageBox = styled.span<{
  sender: boolean;
  topRight?: boolean;
  botRight?: boolean;
  topLeft?: boolean;
  botLeft?: boolean;
}>`
  padding: 6px 12px;
  margin: 1px;
  background-color: ${({ sender }) =>
    sender ? 'rgb(0, 153, 255)' : 'rgb(241, 240, 240)'};
  border-radius: 1.3em;
  border-top-right-radius: ${({ topRight }) => (topRight ? '4px' : null)};
  border-bottom-right-radius: ${({ botRight }) => (botRight ? '4px' : null)};
  border-top-left-radius: ${({ topLeft }) => (topLeft ? '4px' : null)};
  border-bottom-left-radius: ${({ botLeft }) => (botLeft ? '4px' : null)};
  color: ${({ sender }) => (sender ? 'white' : 'black')};
`;

const MessageBoxInput = styled(MessageBox)`
  width: 250px;
`;

const MessageInput = styled.input`
  background-color: rgb(241, 240, 240);
  width: 224px;
  border: none;

  &:focus {
    outline: none;
  }
`;

const ScrollBox = styled.div`
  height: 160px;
  overflow-y: scroll;

  /* width */
  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #fff;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const { Text } = Typography;

export const ChatDraggable = ({
  id,
  initiator,
  close,
  initialSignal,
  sendTransaction
}: ChatDraggableProps) => {
  const {
    connected,
    messages,
    sendMessage,
    addStream,
    removeStream,
    videoRef,
    peerVideo
  } = useWebRTC(id, initiator, close, initialSignal);
  const [input, setInput] = useState<string>('');
  const [video, setVideo] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const { wallet } = useContext(PeerContext);

  const chatNode = (
    <>
      {peerVideo ? (
        <>
          <Video ref={videoRef} />
          <br />
          <br />
        </>
      ) : null}
      <ScrollBox>
        {messages.map(({ sender, content }, idx) => {
          if (sender) {
            let top = false,
              bot = false;
            if (idx > 0 && messages[idx - 1].sender) top = true;
            if (idx < messages.length - 1 && messages[idx + 1].sender)
              bot = true;
            return (
              <div
                style={{ display: 'flex', flexDirection: 'row-reverse' }}
                key={idx}
              >
                <MessageBox sender topRight={top} botRight={bot}>
                  {content}
                </MessageBox>
              </div>
            );
          } else {
            let top = false,
              bot = false;
            if (idx > 0 && !messages[idx - 1].sender) top = true;
            if (idx < messages.length - 1 && !messages[idx + 1].sender)
              bot = true;
            return (
              <div style={{ display: 'flex', flexDirection: 'row' }} key={idx}>
                <MessageBox sender={false} topLeft={top} botLeft={bot}>
                  {content}
                </MessageBox>
              </div>
            );
          }
        })}
      </ScrollBox>
      <br />
      <MessageBoxInput sender={false}>
        <MessageInput
          placeholder='Type a message...'
          onKeyDown={(e) => {
            if (e.keyCode === 13 && input.length > 0) {
              sendMessage(input);
              setInput('');
            }
          }}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
      </MessageBoxInput>
      <br />
      <br />
      {video ? (
        <Video self muted addStream={addStream} removeStream={removeStream} />
      ) : null}
      <Modal
        title={`Transaction to ${id}`}
        visible={modal}
        footer={[]}
        onCancel={() => {
          setModal(false);
        }}
      >
        <Form
          name='transaction'
          onFinish={({ amount }) => {
            sendTransaction(amount, id);
            setModal(false);
          }}
        >
          <Form.Item
            label='Amount'
            name='amount'
            rules={[
              () => ({
                required: true,
                validator(_, value) {
                  if (value && value > 0 && value <= wallet) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    'Please enter an amount greater than zero and not exceeding your wallet!'
                  );
                }
              })
            ]}
          >
            <InputNumber min={0} max={wallet} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Send
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  return (
    <Draggable defaultPosition={{ x: 100, y: 100 }}>
      <StyledCard
        title={id}
        extra={
          <CloseOutlined
            style={{ cursor: 'pointer' }}
            onClick={() => {
              close();
            }}
          />
        }
        actions={[
          <TransactionOutlined
            onClick={() => {
              setModal(true);
            }}
          />,
          <VideoCameraOutlined
            onClick={() => {
              setVideo((prevVal) => !prevVal);
            }}
          />
        ]}
      >
        {connected ? (
          chatNode
        ) : (
          <div style={{ height: 150 }}>
            <Text type='secondary'>Connecting...</Text>
          </div>
        )}
      </StyledCard>
    </Draggable>
  );
};
