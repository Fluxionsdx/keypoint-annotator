import os
import cv2


dir_name = "/Users/Josh/chord_recognition_data/image/"

files = [fileName for fileName in os.listdir(dir_name)]


def resize_images():
	for file in files:
		user = file.split(".")[1]
		if user != "u1":
			path = dir_name + file
			hack_path = dir_name + ".hack." + file
			img = cv2.imread(path)
			print("user: ", user, "shape: ", img.shape)
			print("file: ", path)
			# the naming hack is to prevent being asked permission to overwrite a file that already exists
			resize_command  = "ffmpeg -i {0} -vf scale=640:480 {1}".format(path, hack_path)		
			os.system(resize_command)
			os.system("rm {}".format(path))
			os.system("mv {} {}".format(hack_path, path))

def print_shapes():
	for file in files:
		path = dir_name + file
		img = cv2.imread(path)
		print("image.shape: ", img.shape)


print_shapes()


