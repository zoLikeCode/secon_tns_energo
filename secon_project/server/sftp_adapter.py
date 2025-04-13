#Логика для создания путей одной функцией
def sftp_mkdir_recursive(sftp, remote_path):
    import posixpath

    folders = remote_path.strip("/").split("/")
    current_path = ""
    for folder in folders:
        current_path = posixpath.join(current_path, folder)
        try:
            sftp.stat(current_path)
        except FileNotFoundError:
            sftp.mkdir(current_path)


#Проверка наличия файла
def sftp_file_exists(sftp, path):
    try:
        sftp.stat(path)
        return True
    except FileNotFoundError:
        return False
