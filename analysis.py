import pandas as pd
import numpy as np
from typing import Dict, List, Tuple

class FRCScoutingAnalysis:
    def __init__(self, csv_path: str):
        """Initialize the analysis with a CSV file path."""
        self.df = pd.read_csv(csv_path)
        self.df['total_points'] = self.df['autoPoints'] + self.df['teleopPoints']
    
    def team_summary(self, team_number: int) -> Dict:
        """Generate a summary of a team's performance."""
        team_data = self.df[self.df['teamNumber'] == team_number]
        
        return {
            'matches_played': len(team_data),
            'avg_auto_points': team_data['autoPoints'].mean(),
            'avg_teleop_points': team_data['teleopPoints'].mean(),
            'avg_total_points': team_data['total_points'].mean(),
            'climb_success_rate': team_data['climb'].mean() * 100,
            'highest_score': team_data['total_points'].max(),
            'consistency_score': 100 - team_data['total_points'].std()  # Higher is more consistent
        }
    
    def get_top_teams(self, n: int = 5) -> List[Tuple[int, float]]:
        """Get the top N teams based on average total points."""
        team_averages = self.df.groupby('teamNumber')['total_points'].mean()
        return team_averages.nlargest(n).items()
    
    def alliance_prediction(self, team_numbers: List[int]) -> Dict:
        """Predict alliance performance based on historical data."""
        alliance_stats = []
        for team in team_numbers:
            team_data = self.team_summary(team)
            alliance_stats.append(team_data)
        
        return {
            'predicted_auto_points': sum(stat['avg_auto_points'] for stat in alliance_stats),
            'predicted_teleop_points': sum(stat['avg_teleop_points'] for stat in alliance_stats),
            'predicted_total_points': sum(stat['avg_total_points'] for stat in alliance_stats),
            'climb_reliability': np.mean([stat['climb_success_rate'] for stat in alliance_stats])
        }
    
    def generate_report(self) -> str:
        """Generate a comprehensive scouting report."""
        top_teams = self.get_top_teams()
        report = "FRC Scouting Report\n" + "=" * 20 + "\n\n"
        
        # Overall statistics
        report += f"Total Matches Scouted: {len(self.df)}\n"
        report += f"Number of Teams: {self.df['teamNumber'].nunique()}\n\n"
        
        # Top teams section
        report += "Top Performing Teams:\n"
        for team, score in top_teams:
            team_summary = self.team_summary(team)
            report += f"\nTeam {team}:\n"
            report += f"- Average Points: {score:.1f}\n"
            report += f"- Climb Success Rate: {team_summary['climb_success_rate']:.1f}%\n"
            report += f"- Consistency Score: {team_summary['consistency_score']:.1f}\n"
        
        return report

# Example usage:
if __name__ == "__main__":
    analyzer = FRCScoutingAnalysis("frc_scouting_data.csv")
    
    # Generate team summary
    team_stats = analyzer.team_summary(254)  # Example team number
    print("\nTeam Summary:", team_stats)
    
    # Get top teams
    top_teams = analyzer.get_top_teams()
    print("\nTop Teams:", top_teams)
    
    # Predict alliance performance
    alliance_prediction = analyzer.alliance_prediction([254, 1678, 2056])  # Example alliance
    print("\nAlliance Prediction:", alliance_prediction)
    
    # Generate full report
    report = analyzer.generate_report()
    print("\nFull Report:", report)