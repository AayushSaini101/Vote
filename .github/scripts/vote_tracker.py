import os
from datetime import datetime, timedelta
from github import Github

# Initialize GitHub client
g = Github(os.getenv('GITHUB_TOKEN'))
repo = g.get_repo(os.getenv('GITHUB_REPOSITORY'))

# Define TSC members
tsc_members = ["member1", "member2", "member3"]  # Update with actual member logins

# Get issue or PR that triggered the workflow
issue_comment = repo.get_issue(int(os.getenv('GITHUB_EVENT_ISSUE_NUMBER')))
issue_or_pr = issue_comment.issue

# Check if the vote passed and gather participation
vote_passed = "yes" if "vote passed" in issue_comment.body.lower() else "no"
comments = issue_or_pr.get_comments()
voters = set()
for comment in comments:
    if comment.user.login in tsc_members and "vote" in comment.body.lower():
        voters.add(comment.user.login)

non_voters = set(tsc_members) - voters

# Update vote record
vote_record = {
    "topic": issue_or_pr.title,
    "url": issue_or_pr.html_url,
    "date": datetime.now().strftime("%Y-%m-%d"),
    "result": vote_passed,
    "voters": list(voters),
    "non_voters": list(non_voters)
}

# Read existing vote records
vote_records_path = "VOTE_RECORDS.md"
if os.path.exists(vote_records_path):
    with open(vote_records_path, "r") as file:
        vote_records = file.read().splitlines()
else:
    vote_records = []

# Append new vote record
vote_records.append(f"| {vote_record['date']} | {vote_record['topic']} | [link]({vote_record['url']}) | {vote_record['result']} | {', '.join(vote_record['voters'])} | {', '.join(vote_record['non_voters'])} |")

# Write updated vote records
with open(vote_records_path, "w") as file:
    file.write("\n".join(vote_records))

# Check for members who haven't voted in the last 3 months
three_months_ago = datetime.now() - timedelta(days=90)
inactive_members = {member: 0 for member in tsc_members}

for record in vote_records:
    record_date = datetime.strptime(record.split('|')[1].strip(), "%Y-%m-%d")
    if record_date >= three_months_ago:
        voters = record.split('|')[5].strip().split(', ')
        for voter in voters:
            if voter in inactive_members:
                inactive_members[voter] += 1

# Highlight inactive members
inactive_members_list = [member for member, count in inactive_members.items() if count == 0]

# Update Markdown file
with open(vote_records_path, "a") as file:
    file.write("\n\n## Inactive Members\n")
    if inactive_members_list:
        file.write(f"Members who have not voted in the last 3 months: {', '.join(inactive_members_list)}\n")
    else:
        file.write("All members have participated in the last 3 months.\n")
