package msgsync

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client for the MsgSync API
type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

// Message represents a message object in the platform
type Message struct {
	ID        string                 `json:"id"`
	Recipient string                 `json:"recipient"`
	Content   string                 `json:"content"`
	Status    string                 `json:"status"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// APIResponse represents the standard response wrapper
type APIResponse struct {
	Status  string      `json:"status"`
	Data    interface{} `json:"data"`
	Message string      `json:"message,omitempty"`
}

// NewClient creates a new MsgSync API client
func NewClient(apiKey string, baseURL string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:3001/api"
	}
	return &Client{
		BaseURL: strings.TrimSuffix(baseURL, "/"),
		APIKey:  apiKey,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendMessage sends a new message
func (c *Client) SendMessage(recipient, content string, metadata map[string]interface{}) (*Message, error) {
	payload := map[string]interface{}{
		"recipient": recipient,
		"content":   content,
	}
	if metadata != nil {
		payload["metadata"] = metadata
	}

	var resp APIResponse
	resp.Data = &Message{}
	err := c.request("POST", "/messages", payload, &resp)
	if err != nil {
		return nil, err
	}

	return resp.Data.(*Message), nil
}

// GetMessageStatus retrieves the status of a message
func (c *Client) GetMessageStatus(id string) (*Message, error) {
	var resp APIResponse
	resp.Data = &Message{}
	err := c.request("GET", fmt.Sprintf("/messages/%s", id), nil, &resp)
	if err != nil {
		return nil, err
	}

	return resp.Data.(*Message), nil
}

// ListMessages retrieves a list of recent messages
func (c *Client) ListMessages() ([]Message, error) {
	var resp APIResponse
	var messages []Message
	resp.Data = &messages
	err := c.request("GET", "/messages", nil, &resp)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (c *Client) request(method, path string, body interface{}, result interface{}) error {
	url := c.BaseURL + path
	var bodyReader io.Reader

	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return err
		}
		bodyReader = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var apiErr APIResponse
		json.NewDecoder(resp.Body).Decode(&apiErr)
		return fmt.Errorf("MsgSync API Error (%d): %s", resp.StatusCode, apiErr.Message)
	}

	return json.NewDecoder(resp.Body).Decode(result)
}
