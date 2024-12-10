import os
import dash
import dash_core_components as dcc
import dash_html_components as html
import plotly.express as px
import pandas as pd
from dash.dependencies import Input, Output
from google.cloud import firestore

# Initialize Firestore client
firestore_client = firestore.Client()

# Initialize Dash app
app = dash.Dash(__name__)

# Fetch feedback data
def get_feedback_data():
    feedback_collection = firestore_client.collection('smarttab_feedback')
    docs = feedback_collection.stream()
    
    feedback_data = []
    for doc in docs:
        doc_dict = doc.to_dict()
        feedback_data.append({
            'id': doc.id,
            'feedback': doc_dict.get('feedback', ''),
            'timestamp': doc_dict.get('timestamp'),
            'sentiment': doc_dict.get('sentiment', 'Unprocessed')
        })
    
    return pd.DataFrame(feedback_data)

# Fetch usage stats
def get_usage_stats():
    stats_collection = firestore_client.collection('smarttab_usage_stats')
    docs = stats_collection.stream()
    
    usage_data = []
    for doc in docs:
        doc_dict = doc.to_dict()
        usage_data.append({
            'timestamp': doc_dict.get('timestamp'),
            'organize_tabs': doc_dict.get('stats', {}).get('organizeTabs', 0),
            'deorganize_tabs': doc_dict.get('stats', {}).get('deorganizeTabs', 0)
        })
    
    return pd.DataFrame(usage_data)

# Dashboard Layout
app.layout = html.Div([
    html.H1('SmartTab Organizer - Feedback Dashboard'),
    
    # Feedback Section
    html.Div([
        html.H2('User Feedback'),
        dcc.Graph(id='feedback-sentiment-chart'),
        html.Div(id='feedback-table')
    ]),
    
    # Usage Stats Section
    html.Div([
        html.H2('Usage Statistics'),
        dcc.Graph(id='usage-stats-chart')
    ])
])

# Callback for Feedback Sentiment Chart
@app.callback(
    Output('feedback-sentiment-chart', 'figure'),
    Input('feedback-sentiment-chart', 'id')
)
def update_sentiment_chart(_):
    df = get_feedback_data()
    sentiment_counts = df['sentiment'].value_counts()
    
    return px.pie(
        sentiment_counts, 
        values=sentiment_counts.values, 
        names=sentiment_counts.index, 
        title='Feedback Sentiment Distribution'
    )

# Callback for Feedback Table
@app.callback(
    Output('feedback-table', 'children'),
    Input('feedback-table', 'id')
)
def update_feedback_table(_):
    df = get_feedback_data()
    
    return html.Table([
        html.Thead(
            html.Tr([html.Th(col) for col in ['Timestamp', 'Feedback', 'Sentiment']])
        ),
        html.Tbody([
            html.Tr([
                html.Td(row['timestamp']),
                html.Td(row['feedback']),
                html.Td(row['sentiment'])
            ]) for _, row in df.iterrows()
        ])
    ])

# Callback for Usage Stats Chart
@app.callback(
    Output('usage-stats-chart', 'figure'),
    Input('usage-stats-chart', 'id')
)
def update_usage_stats_chart(_):
    df = get_usage_stats()
    
    return px.line(
        df, 
        x='timestamp', 
        y=['organize_tabs', 'deorganize_tabs'], 
        title='Tab Organization Usage Over Time'
    )

if __name__ == '__main__':
    app.run_server(debug=True)
