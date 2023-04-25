# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.154.0/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
FROM mcr.microsoft.com/devcontainers/typescript-node:20

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=1000

# user and group already added in earlier layer
#RUN groupadd --gid 1000 node
#RUN groupadd --gid $USER_GID $USERNAME
#RUN useradd --uid $USER_UID --gid $USER_GID -m $USERNAME

RUN apt-get update && \
 apt-get install -y sudo && \
 echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
 chmod 0440 /etc/sudoers.d/$USERNAME && \
 echo "umask 0002" >> /home/$USERNAME/.bashrc && \
 sudo -u ${USERNAME} npm install -g gulp-cli && \
 sudo -u ${USERNAME} alias hig='history | grep'

